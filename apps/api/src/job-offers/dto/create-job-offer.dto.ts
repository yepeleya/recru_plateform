import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

// Miroir de @bara/shared-types JobType (validation runtime).
export const JOB_TYPES = [
  'mission-ponctuelle',
  'saisonnier',
  'temps-partiel',
  'temps-plein',
  'a-distance',
  'stage',
] as const;

// Création d'une offre. Le statut n'est PAS accepté du client : toute offre naît
// en 'draft' (publication via l'endpoint dédié). Le slug est généré côté serveur.
export class CreateJobOfferDto {
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  title: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  description: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  metierSlug: string;

  @IsIn(JOB_TYPES)
  type: (typeof JOB_TYPES)[number];

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  city: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  area?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  budgetMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  budgetMax?: number;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  budgetLabel?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
