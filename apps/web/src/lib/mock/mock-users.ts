// SOURCE MOCK PRINCIPALE — utilisateur courant de démonstration (FRONT-1).
// Type UserAccount pré-v3 (voir @bara/shared-types). Les valeurs d'identité sont
// des PLACEHOLDERS FICTIFS : aucun vrai numéro de pièce, aucun secret, aucune
// donnée personnelle réelle. Lu uniquement via lib/data (getCurrentUser).
import type { UserAccount } from "@bara/shared-types";

export const mockCurrentUser: UserAccount = {
  id: "demo-user-1",
  email: "candidat.demo@bara.ci",
  accountType: "candidat",
  verificationStatus: "en-attente",
  businessVerified: false,
  individual: {
    firstName: "Aya",
    lastName: "K.",
    phone: "+225 00 00 00 00",
    city: "Abidjan",
    identityDocument: {
      // Placeholder fictif — jamais un vrai numéro de pièce.
      type: "cni",
      number: "DEMO-CNI-0000",
      frontFileUrl: "/mock/id-placeholder.png",
    },
  },
  createdAt: "2026-06-20T10:00:00Z",
  updatedAt: "2026-07-04T08:00:00Z",
};

export const mockRecruiterUser: UserAccount = {
  id: "demo-recruiter-1",
  email: "recruteur.demo@bara.ci",
  accountType: "recruteur-entreprise",
  verificationStatus: "verifie",
  businessVerified: false,
  business: {
    companyName: "Studio Démo CI",
    sector: "Technologie & digital",
    city: "Abidjan",
    phone: "+225 00 00 00 00",
    representativeFirstName: "Koffi",
    representativeLastName: "D.",
    representativeRole: "Gérant",
    representativeIdentityDocument: {
      type: "cni",
      number: "DEMO-CNI-0001",
      frontFileUrl: "/mock/id-placeholder.png",
    },
  },
  createdAt: "2026-06-18T10:00:00Z",
  updatedAt: "2026-07-01T09:00:00Z",
};
