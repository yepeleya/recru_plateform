import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

// Sauvegarde d'un CV *généré* sur Bara. Le contenu (`content`) suit la structure
// @bara/shared-types CvContent ; sa validation fine est déléguée au frontend (le
// type garantit la forme) + un contrôle minimal côté service (présence de
// personalInfo). On ne duplique pas ici toute l'arborescence CvContent en
// décorateurs class-validator : ce serait fragile et vite désynchronisé.
export class SaveCvDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  templateId?: string;

  @IsObject()
  content: Record<string, unknown>;
}
