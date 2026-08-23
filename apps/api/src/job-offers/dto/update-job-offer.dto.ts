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
import { JOB_TYPES } from './create-job-offer.dto';

// Mise à jour : tous les champs éditables sont optionnels. Le statut et le slug ne
// sont pas modifiables ici (publication/fermeture via endpoints dédiés). Écrit à la
// main plutôt qu'avec PartialType pour ne pas dépendre de @nestjs/mapped-types.
export class UpdateJobOfferDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  metierSlug?: string;

  @IsOptional()
  @IsIn(JOB_TYPES)
  type?: (typeof JOB_TYPES)[number];

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  city?: string;

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
