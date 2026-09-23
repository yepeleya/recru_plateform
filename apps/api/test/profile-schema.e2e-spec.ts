// Migration 4.1 vérifiée sur la base de test : contraintes réellement en place,
// et comportement réel des clés étrangères. Aucun profil fictif n'est conservé :
// chaque test crée puis laisse la remise à zéro nettoyer.
import { closeTestPrisma, resetDatabase, testPrisma } from './db';
import { createUser } from './factories';

const profileData = (userId: string, slug: string) => ({
  slug,
  userId,
  headline: 'Graphiste',
  metierSlug: 'graphiste',
  city: 'Abidjan',
  jobTypes: ['mission-ponctuelle'],
});

describe('Schéma du profil professionnel (migration 4.1)', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await closeTestPrisma();
  });

  it('crée un profil avec les valeurs par défaut du socle V2', async () => {
    const user = await createUser();
    const profile = await testPrisma().workerProfile.create({
      data: profileData(user.id, 'profil-aaaa1111'),
    });

    expect(profile.status).toBe('draft');
    expect(profile.completionScore).toBe(0);
    expect(profile.isVisible).toBe(true);
    // Champs V2 présents et vides tant que rien n'est saisi.
    expect(profile.availability).toBeNull();
    expect(profile.photoKey).toBeNull();
    expect(profile.secondaryMetiers).toBeNull();
    expect(profile.areas).toBeNull();
    expect(profile.experienceYears).toBeNull();
    expect(profile.rateMin).toBeNull();
    expect(profile.rateUnit).toBeNull();
    expect(profile.lastActiveAt).toBeNull();
    expect(profile.cvId).toBeNull();
  });

  it('refuse un second profil pour le même compte', async () => {
    const user = await createUser();
    await testPrisma().workerProfile.create({ data: profileData(user.id, 'profil-bbbb2222') });

    await expect(
      testPrisma().workerProfile.create({ data: profileData(user.id, 'profil-cccc3333') }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('refuse deux profils avec le même identifiant public', async () => {
    const first = await createUser();
    const second = await createUser();
    await testPrisma().workerProfile.create({ data: profileData(first.id, 'profil-dddd4444') });

    await expect(
      testPrisma().workerProfile.create({ data: profileData(second.id, 'profil-dddd4444') }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('supprimer le CV vide la référence sans supprimer le profil', async () => {
    const user = await createUser();
    const cv = await testPrisma().cv.create({
      data: { userId: user.id, title: 'CV de test', source: 'imported', fileKey: 'cle-test.pdf' },
    });
    const profile = await testPrisma().workerProfile.create({
      data: { ...profileData(user.id, 'profil-eeee5555'), cvId: cv.id },
    });

    await testPrisma().cv.delete({ where: { id: cv.id } });

    const after = await testPrisma().workerProfile.findUnique({ where: { id: profile.id } });
    expect(after).not.toBeNull();
    expect(after!.cvId).toBeNull();
  });

  it('refuse un cvId inexistant', async () => {
    const user = await createUser();
    await expect(
      testPrisma().workerProfile.create({
        data: { ...profileData(user.id, 'profil-ffff6666'), cvId: '00000000-0000-4000-8000-000000000000' },
      }),
    ).rejects.toMatchObject({ code: 'P2003' });
  });

  it('supprimer le compte supprime le profil et ses compétences', async () => {
    const user = await createUser();
    const profile = await testPrisma().workerProfile.create({
      data: profileData(user.id, 'profil-gggg7777'),
    });
    await testPrisma().profileSkill.create({ data: { profileId: profile.id, label: 'Illustration' } });

    await testPrisma().user.delete({ where: { id: user.id } });

    expect(await testPrisma().workerProfile.count()).toBe(0);
    expect(await testPrisma().profileSkill.count()).toBe(0);
  });

  it('refuse deux fois la même compétence sur un profil, casse comprise', async () => {
    const user = await createUser();
    const profile = await testPrisma().workerProfile.create({
      data: profileData(user.id, 'profil-hhhh8888'),
    });
    await testPrisma().profileSkill.create({ data: { profileId: profile.id, label: 'Photoshop' } });

    await expect(
      testPrisma().profileSkill.create({ data: { profileId: profile.id, label: 'photoshop' } }),
    ).rejects.toMatchObject({ code: 'P2002' });

    // La même compétence reste possible sur un autre profil.
    const other = await createUser();
    const otherProfile = await testPrisma().workerProfile.create({
      data: profileData(other.id, 'profil-iiii9999'),
    });
    await expect(
      testPrisma().profileSkill.create({ data: { profileId: otherProfile.id, label: 'Photoshop' } }),
    ).resolves.toBeDefined();
  });

  it('expose les index attendus par la recherche publique', async () => {
    const rows = await testPrisma().$queryRawUnsafe<{ INDEX_NAME: string }[]>(
      "SELECT DISTINCT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'worker_profiles'",
    );
    const names = rows.map((row) => row.INDEX_NAME);
    expect(names).toEqual(
      expect.arrayContaining([
        'worker_profiles_userId_key',
        'worker_profiles_slug_key',
        'worker_profiles_status_isVisible_metierSlug_idx',
        'worker_profiles_status_isVisible_city_idx',
      ]),
    );
    // L'index simple sur userId a bien disparu au profit de l'unique.
    expect(names).not.toContain('worker_profiles_userId_idx');
  });
});
