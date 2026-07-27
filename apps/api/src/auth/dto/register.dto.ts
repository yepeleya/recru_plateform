import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

// Les valeurs autorisées miroir exactement les unions de littéraux définies
// dans @bara/shared-types (AccountType, IdDocumentType). class-validator ne
// peut pas valider directement contre un type TypeScript à l'exécution —
// cette liste doit rester synchronisée avec packages/shared-types/src/account.ts.
const ACCOUNT_TYPES = ['candidat', 'recruteur-particulier', 'recruteur-entreprise'] as const;
const ID_DOCUMENT_TYPES = ['cni', 'passeport', 'permis-conduire'] as const;

export class RegisterDto {
  @IsIn(ACCOUNT_TYPES)
  accountType: (typeof ACCOUNT_TYPES)[number];

  @IsEmail()
  @MaxLength(255)
  email: string;

  // Au moins une minuscule, une majuscule et un chiffre.
  @IsString()
  @MinLength(8)
  @MaxLength(72) // bcrypt tronque silencieusement au-delà de 72 octets
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre.',
  })
  password: string;

  @IsString()
  @MaxLength(30)
  phone: string;

  @IsString()
  @MaxLength(100)
  city: string;

  // --- Candidat / recruteur-particulier ---
  @ValidateIf((o: RegisterDto) => o.accountType !== 'recruteur-entreprise')
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName?: string;

  @ValidateIf((o: RegisterDto) => o.accountType !== 'recruteur-entreprise')
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName?: string;

  // --- Recruteur-entreprise ---
  @ValidateIf((o: RegisterDto) => o.accountType === 'recruteur-entreprise')
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  companyName?: string;

  @ValidateIf((o: RegisterDto) => o.accountType === 'recruteur-entreprise')
  @IsString()
  @MaxLength(100)
  sector?: string;

  @ValidateIf((o: RegisterDto) => o.accountType === 'recruteur-entreprise')
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  representativeFirstName?: string;

  @ValidateIf((o: RegisterDto) => o.accountType === 'recruteur-entreprise')
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  representativeLastName?: string;

  @ValidateIf((o: RegisterDto) => o.accountType === 'recruteur-entreprise')
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  representativeRole?: string;

  // RCCM optionnel au lancement, même pour une entreprise.
  @IsOptional()
  @IsString()
  @MaxLength(50)
  rccmNumber?: string;

  // --- Pièce d'identité (obligatoire pour tous) ---
  @IsIn(ID_DOCUMENT_TYPES)
  idDocumentType: (typeof ID_DOCUMENT_TYPES)[number];

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  idDocumentNumber: string;
}
