// Present era avatars (urban street style)
import presentGuerreiroM from "@/assets/present-guerreiro-m.png";
import presentGuerreiroF from "@/assets/present-guerreiro-f.png";
import presentMagoM from "@/assets/present-mago-m.png";
import presentMagoF from "@/assets/present-mago-f.png";
import presentAprendizM from "@/assets/present-aprendiz-m.png";
import presentAprendizF from "@/assets/present-aprendiz-f.png";
import presentSabioM from "@/assets/present-sabio-m.png";
import presentSabioF from "@/assets/present-sabio-f.png";
import presentAnciaoM from "@/assets/present-anciao-m.png";
import presentAnciaoF from "@/assets/present-anciao-f.png";
import presentDesbravadorM from "@/assets/present-desbravador-m.png";
import presentDesbravadorF from "@/assets/present-desbravador-f.png";
import presentAnaoM from "@/assets/present-anao-m.png";
import presentAnaoF from "@/assets/present-anao-f.png";

// Past era avatars (medieval epic)
import pastGuerreiroM from "@/assets/past-guerreiro-m.png";
import pastGuerreiroF from "@/assets/past-guerreiro-f.png";
import pastMagoM from "@/assets/past-mago-m.png";
import pastMagoF from "@/assets/past-mago-f.png";
import pastAprendizM from "@/assets/past-aprendiz-m.png";
import pastAprendizF from "@/assets/past-aprendiz-f.png";
import pastSabioM from "@/assets/past-sabio-m.png";
import pastSabioF from "@/assets/past-sabio-f.png";
import pastAnciaoM from "@/assets/past-anciao-m.png";
import pastAnciaoF from "@/assets/past-anciao-f.png";
import pastDesbravadorM from "@/assets/past-desbravador-m.png";
import pastDesbravadorF from "@/assets/past-desbravador-f.png";
import pastAnaoM from "@/assets/past-anao-m.png";
import pastAnaoF from "@/assets/past-anao-f.png";

// Future era avatars (cyberpunk high-tech)
import futureGuerreiroM from "@/assets/future-guerreiro-m.png";
import futureGuerreiroF from "@/assets/future-guerreiro-f.png";
import futureMagoM from "@/assets/future-mago-m.png";
import futureMagoF from "@/assets/future-mago-f.png";
import futureAprendizM from "@/assets/future-aprendiz-m.png";
import futureAprendizF from "@/assets/future-aprendiz-f.png";
import futureSabioM from "@/assets/future-sabio-m.png";
import futureSabioF from "@/assets/future-sabio-f.png";
import futureAnciaoM from "@/assets/future-anciao-m.png";
import futureAnciaoF from "@/assets/future-anciao-f.png";
import futureDesbravadorM from "@/assets/future-desbravador-m.png";
import futureDesbravadorF from "@/assets/future-desbravador-f.png";
import futureAnaoM from "@/assets/future-anao-m.png";
import futureAnaoF from "@/assets/future-anao-f.png";

export type EraId = "present" | "past" | "future";
export type ClassId = "guerreiro" | "mago" | "aprendiz" | "sabio" | "anciao" | "desbravador" | "anao";

interface EraAvatars {
  m: string;
  f: string;
}

type AvatarMap = Record<EraId, Record<ClassId, EraAvatars>>;

export const eraAvatars: AvatarMap = {
  present: {
    guerreiro: { m: presentGuerreiroM, f: presentGuerreiroF },
    mago: { m: presentMagoM, f: presentMagoF },
    aprendiz: { m: presentAprendizM, f: presentAprendizF },
    sabio: { m: presentSabioM, f: presentSabioF },
    anciao: { m: presentAnciaoM, f: presentAnciaoF },
    desbravador: { m: presentDesbravadorM, f: presentDesbravadorF },
    anao: { m: presentAnaoM, f: presentAnaoF },
  },
  past: {
    guerreiro: { m: pastGuerreiroM, f: pastGuerreiroF },
    mago: { m: pastMagoM, f: pastMagoF },
    aprendiz: { m: pastAprendizM, f: pastAprendizF },
    sabio: { m: pastSabioM, f: pastSabioF },
    anciao: { m: pastAnciaoM, f: pastAnciaoF },
    desbravador: { m: pastDesbravadorM, f: pastDesbravadorF },
    anao: { m: pastAnaoM, f: pastAnaoF },
  },
  future: {
    guerreiro: { m: futureGuerreiroM, f: futureGuerreiroF },
    mago: { m: futureMagoM, f: futureMagoF },
    aprendiz: { m: futureAprendizM, f: futureAprendizF },
    sabio: { m: futureSabioM, f: futureSabioF },
    anciao: { m: futureAnciaoM, f: futureAnciaoF },
    desbravador: { m: futureDesbravadorM, f: futureDesbravadorF },
    anao: { m: futureAnaoM, f: futureAnaoF },
  },
};

export const eraClassNames: Record<EraId, Record<ClassId, string>> = {
  present: {
    guerreiro: "Fighter Urbano",
    mago: "Mago Tech",
    aprendiz: "Aprendiz Street",
    sabio: "Sábio Moderno",
    anciao: "Ancião Elegante",
    desbravador: "Desbravador Urban",
    anao: "Anão Reciclador",
  },
  past: {
    guerreiro: "Cavaleiro",
    mago: "Feiticeiro",
    aprendiz: "Escudeiro",
    sabio: "Monge Sábio",
    anciao: "Rei Ancião",
    desbravador: "Patrulheiro",
    anao: "Ferreiro Anão",
  },
  future: {
    guerreiro: "Soldado Cibernético",
    mago: "Mago Cibernético",
    aprendiz: "Cadete Neon",
    sabio: "Professor IA",
    anciao: "Android Ancião",
    desbravador: "Explorador Jet",
    anao: "Mech Forjador",
  },
};
