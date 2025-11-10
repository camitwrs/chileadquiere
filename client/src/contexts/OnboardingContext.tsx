import React, { createContext, useContext, useState, ReactNode } from "react";

export type PersonType = "natural" | "juridica";

export interface BasicInfo {
  personType?: PersonType;
  rut?: string;
  nombre?: string;
  fechaNacimiento?: string;
  email?: string;
  telefono?: string;
  razonSocial?: string;
  sitioWeb?: string;
  industria?: string;
}

export interface DocumentsState {
  [key: string]: File | null;
}

export interface CommercialInfo {
  rubros?: string[];
  experienciaAnios?: number;
  empleados?: string;
  facturacion?: string;
  certificaciones?: string[];
  descripcion?: string;
}

export interface ContactInfo {
  contactoNombre?: string;
  contactoEmail?: string;
  contactoTelefono?: string;
  contactoCargo?: string;
  representanteNombre?: string;
  representanteEmail?: string;
  representanteRUT?: string;
  direccion?: {
    calle?: string;
    numero?: string;
    extra?: string;
    ciudad?: string;
    region?: string;
    codigoPostal?: string;
    pais?: string;
  };
}

export interface SecurityInfo {
  username?: string;
  email?: string;
  password?: string;
  twoFA?: {
    method?: "email" | "sms" | "authenticator";
    verified?: boolean;
  };
  acceptedTerms?: boolean;
  acceptedPrivacy?: boolean;
  receiveEmails?: boolean;
}

export interface OnboardingState {
  basicInfo: BasicInfo;
  documents: DocumentsState;
  commercial: CommercialInfo;
  contact: ContactInfo;
  security: SecurityInfo;
}

const initialState: OnboardingState = {
  basicInfo: {},
  documents: {},
  commercial: {},
  contact: {},
  security: { receiveEmails: true },
};

interface OnboardingContextType {
  state: OnboardingState;
  setBasicInfo: (data: Partial<BasicInfo>) => void;
  setDocuments: (data: DocumentsState) => void;
  setCommercial: (data: Partial<CommercialInfo>) => void;
  setContact: (data: Partial<ContactInfo>) => void;
  setSecurity: (data: Partial<SecurityInfo>) => void;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(initialState);

  const setBasicInfo = (data: Partial<BasicInfo>) => {
    setState((s) => ({ ...s, basicInfo: { ...s.basicInfo, ...data } }));
  };

  const setDocuments = (data: DocumentsState) => {
    setState((s) => ({ ...s, documents: { ...s.documents, ...data } }));
  };

  const setCommercial = (data: Partial<CommercialInfo>) => {
    setState((s) => ({ ...s, commercial: { ...s.commercial, ...data } }));
  };

  const setContact = (data: Partial<ContactInfo>) => {
    setState((s) => ({ ...s, contact: { ...s.contact, ...data } }));
  };

  const setSecurity = (data: Partial<SecurityInfo>) => {
    setState((s) => ({ ...s, security: { ...s.security, ...data } }));
  };

  const reset = () => setState(initialState);

  return (
    <OnboardingContext.Provider
      value={{ state, setBasicInfo, setDocuments, setCommercial, setContact, setSecurity, reset }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}

export default OnboardingProvider;
