import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

// Le CV joint n'est PAS accepté depuis le client : il est dérivé côté serveur du
// CV actif du candidat (règle « le CV utilisé doit correspondre au CV réellement
// enregistré »). On ne fait jamais confiance au frontend pour cette association.
export class CreateApplicationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(36) // id d'offre = uuid CHAR(36)
  jobOfferId: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}
