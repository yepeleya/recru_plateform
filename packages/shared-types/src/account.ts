// Modèle de compte utilisateur Bara — candidats et recruteurs (particuliers ou entreprises).
//
// Vérification d'identité : ASYNCHRONE. Le compte est actif dès l'inscription ; un
// administrateur valide ensuite la pièce d'identité en arrière-plan et le badge
// "Profil vérifié" apparaît une fois validé (voir VerificationStatus).
//
// RCCM (registre de commerce) : OPTIONNEL au lancement pour les comptes entreprise,
// afin de ne pas exclure les structures informelles. Un badge "Entreprise vérifiée"
// distinct s'affiche uniquement si le RCCM est fourni et validé.

export type AccountType = 'candidat' | 'recruteur-particulier' | 'recruteur-entreprise';

export type IdDocumentType = 'cni' | 'passeport' | 'permis-conduire';

export type VerificationStatus = 'non-verifie' | 'en-attente' | 'verifie' | 'rejete';

export const BUSINESS_SECTORS = [
  'Commerce & distribution',
  'Grande distribution / Supermarché',
  'Restauration & hôtellerie',
  'BTP & construction',
  'Technologie & digital',
  'Services aux particuliers',
  'Événementiel',
  'Transport & logistique',
  'Autre',
] as const;

export type BusinessSector = (typeof BUSINESS_SECTORS)[number];

/**
 * Pièce d'identité — stockée en fichier privé (jamais d'URL publique). Seul le
 * propriétaire (auth.uid()) et un rôle admin backend peuvent y accéder.
 */
export interface IdentityDocument {
  type: IdDocumentType;
  number: string;
  frontFileUrl: string;
  backFileUrl?: string;
}

export interface IndividualAccountInfo {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  identityDocument: IdentityDocument;
}

export interface BusinessAccountInfo {
  companyName: string;
  sector: BusinessSector;
  city: string;
  phone: string;
  rccmNumber?: string; // optionnel au lancement
  rccmFileUrl?: string;
  representativeFirstName: string;
  representativeLastName: string;
  representativeRole: string; // ex: "Gérante", "Responsable RH"
  representativeIdentityDocument: IdentityDocument;
}

export interface UserAccount {
  id: string;
  email: string;
  accountType: AccountType;
  verificationStatus: VerificationStatus;
  businessVerified: boolean; // true seulement si RCCM fourni ET validé
  individual?: IndividualAccountInfo; // candidat ou recruteur-particulier
  business?: BusinessAccountInfo; // recruteur-entreprise
  createdAt: string;
  updatedAt: string;
}
