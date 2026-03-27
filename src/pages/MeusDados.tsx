import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Trash2, AlertTriangle, Wallet, Phone, User, MapPin, Loader2, Camera, X, Briefcase } from "lucide-react";
import EditableAvatar from "@/components/EditableAvatar";
import pcdIcon from "@/assets/pcd-icon.jpg";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { DatePicker } from "@/components/ui/date-picker";

const API_BASE_URL = import.meta.env.API_BASE_URL;
const ORIGIN_TYPE = "Web";

const areasAtuacao = [
  { id: "garcom", label: "Garçom/Garçonete" },
  { id: "bartender", label: "Bartender" },
  { id: "cozinheiro", label: "Cozinheiro(a)" },
  { id: "auxiliar-cozinha", label: "Auxiliar de Cozinha" },
  { id: "recepcao", label: "Recepção" },
  { id: "caixa", label: "Caixa" },
  { id: "churrasqueiro", label: "Churrasqueiro" },
  { id: "copeira", label: "Copeira" },
  { id: "recreacao-infantil", label: "Recreação Infantil" },
  { id: "musica-ao-vivo", label: "Música ao Vivo" },
  { id: "dj", label: "DJ" },
  { id: "barista", label: "Barista" },
  { id: "seguranca", label: "Segurança" },
  { id: "hostess", label: "Hostess" },
  { id: "manobrista", label: "Manobrista" },
  { id: "camareira", label: "Camareira" },
  { id: "auxiliar-limpeza", label: "Auxiliar de Limpeza" },
  { id: "chapeiro", label: "Chapeiro(a)" },
  { id: "cumim", label: "Cumim" },
];

const grausParentesco = [
  "Pais", "Irmãos(ãs)", "Cônjuge", "Tios(as) e Avós(ôs)", "Amigos(as)",
];

const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const maskCEP = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.replace(/(\d{5})(\d)/, "$1-$2");
};

const getHeaders = (token: string) => ({
  "Content-Type": "application/json",
  "Origin-type": ORIGIN_TYPE,
  Authorization: `Bearer ${token}`,
});

// Snapshot helpers for change detection
interface UserSnapshot { nome: string; email: string; telefone: string }
interface PixSnapshot { chavePixType: string; chavePix: string }
interface ProviderSnapshot {
  dataNascimento: string; sexo: string; isPCD: boolean;
  desiredJobVacancy: string;
  contatoEmergNome: string; contatoEmergParentesco: string; contatoEmergTelefone: string;
  cep: string; rua: string; complemento: string; bairro: string; numero: string; cidade: string; estado: string;
}

const snap = (o: any) => JSON.stringify(o);

const MeusDados = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // User data
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  // Provider data
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [sexo, setSexo] = useState("");
  const [providerId, setProviderId] = useState("");
  const [isPCD, setIsPCD] = useState(false);

  // Profile image
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  // Desired job vacancy (areas)
  const [areasSelecionadas, setAreasSelecionadas] = useState<string[]>([]);

  // Address
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [numero, setNumero] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [cepLoading, setCepLoading] = useState(false);

  // ViaCEP metadata
  const [viacepMeta, setViacepMeta] = useState({ ibge: "", gia: "", ddd: "", siafi: "" });

  // Emergency contact
  const [contatoEmergNome, setContatoEmergNome] = useState("");
  const [contatoEmergParentesco, setContatoEmergParentesco] = useState("");
  const [contatoEmergTelefone, setContatoEmergTelefone] = useState("");

  // Pix
  const [chavePixType, setChavePixType] = useState("");
  const [chavePix, setChavePix] = useState("");

  // Delete account
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigoOTP, setCodigoOTP] = useState("");
  const [confirmadoDelete, setConfirmadoDelete] = useState(false);
  const [hasExistingPixKey, setHasExistingPixKey] = useState(false);

  // Original snapshots for change detection
  const [origUser, setOrigUser] = useState("");
  const [origPix, setOrigPix] = useState("");
  const [origProvider, setOrigProvider] = useState("");
  const [origProfileImage, setOrigProfileImage] = useState<string | null>(null);

  const currentUserSnap = useCallback((): string => snap({ nome, email, telefone } as UserSnapshot), [nome, email, telefone]);
  const currentPixSnap = useCallback((): string => snap({ chavePixType, chavePix } as PixSnapshot), [chavePixType, chavePix]);
  const currentProviderSnap = useCallback((): string => {
    const areasLabels = areasSelecionadas
      .map((id) => areasAtuacao.find((a) => a.id === id)?.label || id)
      .join(", ");
    return snap({
      dataNascimento, sexo, isPCD,
      desiredJobVacancy: areasLabels,
      contatoEmergNome, contatoEmergParentesco, contatoEmergTelefone,
      cep, rua, complemento, bairro, numero, cidade, estado,
    } as ProviderSnapshot);
  }, [dataNascimento, sexo, isPCD, areasSelecionadas, contatoEmergNome, contatoEmergParentesco, contatoEmergTelefone, cep, rua, complemento, bairro, numero, cidade, estado]);

  const previewFoto = useMemo(() => {
    if (profileImageFile) return URL.createObjectURL(profileImageFile);
    return profileImageUrl;
  }, [profileImageFile, profileImageUrl]);

  // Parse desiredJobVacancy string into area IDs
  const parseAreasFromApi = (desiredJobVacancy: string) => {
    if (!desiredJobVacancy) return [];
    const labels = desiredJobVacancy.split(",").map((s) => s.trim().toLowerCase());
    return areasAtuacao
      .filter((a) => labels.includes(a.label.toLowerCase()))
      .map((a) => a.id);
  };

  // ViaCEP
  const buscarCep = useCallback(async (digits: string) => {
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setRua(data.logradouro || "");
        setBairro(data.bairro || "");
        setCidade(data.localidade || "");
        setEstado(data.uf || "");
        setViacepMeta({
          ibge: data.ibge || "",
          gia: data.gia || "",
          ddd: data.ddd || "",
          siafi: data.siafi || "",
        });
      }
    } catch { /* silently fail */ }
    finally { setCepLoading(false); }
  }, []);

  const handleCepChange = (value: string) => {
    const masked = maskCEP(value);
    setCep(masked);
    const digits = value.replace(/\D/g, "");
    if (digits.length === 8) buscarCep(digits);
  };

  useEffect(() => {
    const fetchData = async () => {
      const raw = localStorage.getItem("authToken");
      if (!raw) return;
      const token = JSON.parse(raw) as string;
      const headers = getHeaders(token);

      try {
        // Step 1: user info + provider ID
        const [meRes, provListRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users/me`, { method: "GET", credentials: "include", headers }),
          fetch(`${API_BASE_URL}/users/providers`, { method: "GET", credentials: "include", headers }),
        ]);

        let uSnap: UserSnapshot = { nome: "", email: "", telefone: "" };
        if (meRes.ok) {
          const meBody = await meRes.json();
          const me = meBody?.data ?? meBody;
          console.log("[DEBUG] GET /users/me:", me);
          const n = me?.name ?? "";
          const e = me?.email ?? "";
          const t = me?.phoneNumber ? maskPhone(me.phoneNumber) : "";
          setNome(n); setEmail(e); setTelefone(t);
          uSnap = { nome: n, email: e, telefone: t };
        } else {
          console.error("[DEBUG] GET /users/me failed:", meRes.status);
        }
        setOrigUser(snap(uSnap));

        let pId = "";
        let providerProfileImage: string | null = null;
        if (provListRes.ok) {
          const provListBody = await provListRes.json();
          console.log("[DEBUG] GET /users/providers:", provListBody);
          const rawList = provListBody?.data ?? provListBody;
          const first = Array.isArray(rawList) ? rawList[0] : rawList;
          pId = first?.id ?? "";
          providerProfileImage = first?.profileImage ?? null;
          setProviderId(pId);
          console.log("[DEBUG] pId:", pId);
        } else {
          console.error("[DEBUG] GET /users/providers failed:", provListRes.status);
        }

        let pSnap: ProviderSnapshot = {
          dataNascimento: "", sexo: "", isPCD: false, desiredJobVacancy: "",
          contatoEmergNome: "", contatoEmergParentesco: "", contatoEmergTelefone: "",
          cep: "", rua: "", complemento: "", bairro: "", numero: "", cidade: "", estado: "",
        };

        // Step 2: full provider data from GET /providers/{id}
        if (pId) {
          const provRes = await fetch(`${API_BASE_URL}/providers/${pId}`, { method: "GET", credentials: "include", headers });
          if (provRes.ok) {
            const provBody = await provRes.json();
            const prov = provBody?.data ?? provBody;
            console.log("[DEBUG] GET /providers providerData:", prov);
            // Usa profileImage do GET /users/providers como fonte da verdade
            if (providerProfileImage) prov.profileImage = providerProfileImage;

            setCpf(prov.cpf ?? "");

            const bd = prov.birthdate ? prov.birthdate.split("T")[0] : "";
            setDataNascimento(bd);
            const g = prov.gender ?? "";
            setSexo(g);
            const pcd = prov.deficiency === true || prov.deficiency === "true" || prov.deficiency === 1;
            setIsPCD(pcd);

           // Profile image
           const imgUrl = pickImageUrlFromPayload(prov, [
             "profileImage",
             "profileImageUrl",
             "avatarUrl",
             "avatar",
             "image",
             "imageUrl",
             "photoUrl",
           ]);
           if (imgUrl) { setProfileImageUrl(imgUrl); setOrigProfileImage(imgUrl); }

           // Desired job vacancy
           const djv = prov.desiredJobVacancy ?? "";
           const areas = parseAreasFromApi(djv);
           setAreasSelecionadas(areas);

           // Address
           const cepVal = prov.cep ? maskCEP(prov.cep) : "";
           setCep(cepVal);
           setRua(prov.street ?? "");
           setComplemento(prov.complement ?? "");
           setBairro(prov.neighborhood ?? "");
           setNumero(prov.number ?? "");
           setCidade(prov.city ?? "");
           setEstado(prov.uf ?? "");

           // ViaCEP meta from API
           if (prov.ibge || prov.gia || prov.ddd || prov.siafi) {
             setViacepMeta({ ibge: prov.ibge || "", gia: prov.gia || "", ddd: prov.ddd || "", siafi: prov.siafi || "" });
           }

           // Emergency contact
           const ecn = prov.emergencyContactName ?? "";
           const ect = prov.emergencyContactNumber ? maskPhone(prov.emergencyContactNumber) : "";
           const ecr = prov.emergencyContactRelationship ?? "";
           setContatoEmergNome(ecn);
           setContatoEmergTelefone(ect);
           setContatoEmergParentesco(ecr);

           const areasLabels = areas.map((id) => areasAtuacao.find((a) => a.id === id)?.label || id).join(", ");
           pSnap = {
             dataNascimento: bd, sexo: g, isPCD: pcd, desiredJobVacancy: areasLabels,
             contatoEmergNome: ecn, contatoEmergParentesco: ecr, contatoEmergTelefone: ect,
             cep: cepVal, rua: prov.street ?? "", complemento: prov.complement ?? "",
             bairro: prov.neighborhood ?? "", numero: prov.number ?? "",
             cidade: prov.city ?? "", estado: prov.uf ?? "",
           };

            // PIX - pegar da resposta de /users/providers
            const rawPixType = prov.pixKeyType ?? "";
            const rawPixValue = prov.pixKeyValue ?? "";
            const normalizePixType = (type: string): string => {
              const typeLower = type.toLowerCase();
              if (typeLower === "cpf" || typeLower === "cnpj") return typeLower;
              if (typeLower === "email" || typeLower === "e-mail") return "email";
              if (typeLower === "phone" || typeLower === "telefone" || typeLower === "celular") return "telefone";
              if (typeLower === "random" || typeLower === "aleatoria" || typeLower === "aleatório") return "aleatoria";
              return typeLower;
            };
            const normalizedPixType = normalizePixType(rawPixType);
            setChavePixType(normalizedPixType);
            setChavePix(rawPixValue);
            setOrigPix(snap({ chavePixType: normalizedPixType, chavePix: rawPixValue }));
            setHasExistingPixKey(!!rawPixValue);
          }
        }

        setOrigProvider(snap(pSnap));
      } catch (err) {
        console.error("[MeusDados] erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleArea = (id: string) => {
    setAreasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    const hasUserChanges = currentUserSnap() !== origUser;
    const hasPixChanges = currentPixSnap() !== origPix;
    const hasProviderChanges = currentProviderSnap() !== origProvider || profileImageFile !== null;

    if (!hasUserChanges && !hasPixChanges && !hasProviderChanges) {
      toast({ title: errorMessages.noChangesDetected, description: "Nenhum campo foi modificado." });
      return;
    }

    setSaving(true);
    try {
      const tokenRaw = localStorage.getItem("authToken");
      const authUserRaw = localStorage.getItem("authUser");
      if (!tokenRaw) {
        toast({ title: "Erro", description: "Token de autenticação não encontrado.", variant: "destructive" });
        setSaving(false);
        return;
      }
      const token = JSON.parse(tokenRaw);
      const userId = authUserRaw ? JSON.parse(authUserRaw)?.id : null;
      const results: boolean[] = [];

      // 1. PUT /users (user data)
      if (hasUserChanges && userId) {
        const userRes = await fetch(`${API_BASE_URL}/users`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Origin-type": ORIGIN_TYPE,
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: userId,
            name: nome,
            email: email,
            phoneNumber: telefone.replace(/\D/g, ""),
            status: "active",
          }),
        });
        if (userRes.ok) {
          setOrigUser(currentUserSnap());
          results.push(true);
        } else {
          console.error("[MeusDados] User save failed:", userRes.status);
          results.push(false);
        }
      }

      // 2. PUT /providers/pix-keys
      if (hasPixChanges) {
        if (hasExistingPixKey) {
          // Update existing PIX key
          const pixRes = await fetch(`${API_BASE_URL}/providers/pix-keys`, {
            method: "PUT",
            credentials: "include",
            headers: {
              "Origin-type": ORIGIN_TYPE,
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              key: chavePix,
              type: chavePixType,
            }),
          });
          if (pixRes.ok) {
            setOrigPix(currentPixSnap());
            results.push(true);
          } else {
            console.error("[MeusDados] Pix update failed:", pixRes.status);
            results.push(false);
          }
        } else {
          // Create new PIX key
          const pixRes = await fetch(`${API_BASE_URL}/providers/pix-keys`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Origin-type": ORIGIN_TYPE,
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              key: chavePix,
              type: chavePixType,
              createdAt: new Date().toISOString(),
              providerId: providerId,
            }),
          });
          if (pixRes.ok) {
            setOrigPix(currentPixSnap());
            setHasExistingPixKey(true);
            results.push(true);
          } else {
            console.error("[MeusDados] Pix create failed:", pixRes.status);
            results.push(false);
          }
        }
      }

      // 3. PUT /providers (provider data)
      if (hasProviderChanges) {
        const areasLabels = areasSelecionadas
          .map((id) => areasAtuacao.find((a) => a.id === id)?.label || id)
          .join(", ");

        const providerData: Record<string, unknown> = {};

        let hasProviderFieldChanges = false;
        try {
          const orig = origProvider ? JSON.parse(origProvider) : {};
          const current: ProviderSnapshot = {
            dataNascimento, sexo, isPCD,
            desiredJobVacancy: areasLabels,
            contatoEmergNome, contatoEmergParentesco, contatoEmergTelefone,
            cep, rua, complemento, bairro, numero, cidade, estado,
          };
          
          const fieldsToCompare: (keyof ProviderSnapshot)[] = [
            "dataNascimento", "sexo", "isPCD", "desiredJobVacancy",
            "contatoEmergNome", "contatoEmergParentesco", "contatoEmergTelefone",
            "cep", "rua", "complemento", "bairro", "numero", "cidade", "estado"
          ];
          
          for (const field of fieldsToCompare) {
            if (orig[field] !== current[field]) {
              hasProviderFieldChanges = true;
              (providerData as Record<string, string>)[field === "desiredJobVacancy" ? "desiredJobVacancy" : field] = current[field] as string;
            }
          }
        } catch {
          hasProviderFieldChanges = true;
        }

        const hasNewImage = profileImageFile !== null;

        if (hasNewImage) {
          const fd = new FormData();
          fd.append("profileImage", profileImageFile, profileImageFile.name);

          if (hasProviderFieldChanges) {
            if (dataNascimento) {
              const date = new Date(dataNascimento);
              if (!isNaN(date.getTime())) {
                fd.append("birthdate", date.toISOString().split('T')[0]);
              } else {
                fd.append("birthdate", dataNascimento);
              }
            }
            fd.append("gender", sexo || "");
            fd.append("deficiency", isPCD ? "true" : "false");
            fd.append("desiredJobVacancy", areasLabels);
            fd.append("emergencyContactName", contatoEmergNome || "");
            fd.append("emergencyContactRelationship", contatoEmergParentesco || "");
            fd.append("emergencyContactNumber", contatoEmergTelefone.replace(/\D/g, "") || "");
            fd.append("cep", cep.replace(/\D/g, "") || "");
            fd.append("street", rua || "");
            fd.append("complement", complemento || "");
            fd.append("neighborhood", bairro || "");
            fd.append("number", numero || "");
            fd.append("city", cidade || "");
            fd.append("uf", estado || "");
            fd.append("ibge", viacepMeta.ibge || "");
            fd.append("gia", viacepMeta.gia || "");
            fd.append("ddd", viacepMeta.ddd || "");
            fd.append("siafi", viacepMeta.siafi || "");
          }

          const provRes = await apiFetch(`${API_BASE_URL}/providers`, {
            method: "PUT",
            body: fd,
          });
          if (provRes.ok) {
            const provBody = await provRes.json().catch(() => null);
            setOrigProvider(currentProviderSnap());
            const displayUrl = URL.createObjectURL(profileImageFile);
            setProfileImageUrl(displayUrl);
            setOrigProfileImage(displayUrl);
            setProfileImageFile(null);
            results.push(true);
          } else {
            console.error("[MeusDados] Provider save failed:", provRes.status);
            results.push(false);
          }
        } else if (hasProviderFieldChanges) {
          const payload: Record<string, unknown> = {};

          if (dataNascimento) {
            const date = new Date(dataNascimento);
            if (!isNaN(date.getTime())) {
              payload.birthdate = date.toISOString().split('T')[0];
            } else {
              payload.birthdate = dataNascimento;
            }
          }
          payload.gender = sexo || "";
          payload.deficiency = isPCD ? "true" : "false";
          payload.desiredJobVacancy = areasLabels;
          payload.emergencyContactName = contatoEmergNome || "";
          payload.emergencyContactRelationship = contatoEmergParentesco || "";
          payload.emergencyContactNumber = contatoEmergTelefone.replace(/\D/g, "") || "";
          payload.cep = cep.replace(/\D/g, "") || "";
          payload.street = rua || "";
          payload.complement = complemento || "";
          payload.neighborhood = bairro || "";
          payload.number = numero || "";
          payload.city = cidade || "";
          payload.uf = estado || "";
          payload.ibge = viacepMeta.ibge || "";
          payload.gia = viacepMeta.gia || "";
          payload.ddd = viacepMeta.ddd || "";
          payload.siafi = viacepMeta.siafi || "";

          const provRes = await fetch(`${API_BASE_URL}/users`, {
            method: "PUT",
            credentials: "include",
            headers: {
              "Origin-type": ORIGIN_TYPE,
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          if (provRes.ok) {
            setOrigProvider(currentProviderSnap());
            results.push(true);
          } else {
            console.error("[MeusDados] Provider save failed:", provRes.status);
            results.push(false);
          }
        } else {
          results.push(true);
        }
      }

      if (results.every((r) => r)) {
        toast({ title: "Dados atualizados", description: "As informações foram salvas com sucesso." });
      } else if (results.some((r) => r)) {
        toast({ title: "Atualização parcial", description: "Alguns dados foram salvos, mas houve erro em parte da atualização.", variant: "destructive" });
      } else {
        toast({ title: "Erro ao salvar", description: "Não foi possível atualizar os dados. Tente novamente.", variant: "destructive" });
      }
    } catch (err) {
      console.error("[MeusDados] Save error:", err);
      toast({ title: "Erro ao salvar", description: "Ocorreu um erro inesperado. Tente novamente.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEnviarCodigo = () => {
    setCodigoEnviado(true);
    toast({ title: "Código enviado", description: "Verifique seu e-mail para o código de confirmação." });
  };

  const handleConfirmarDelete = () => {
    if (codigoOTP.length === 6) {
      setConfirmadoDelete(true);
      setTimeout(() => {
        setDeleteDialog(false);
        setConfirmadoDelete(false);
        setCodigoEnviado(false);
        setCodigoOTP("");
      }, 5000);
    }
  };

  if (loading) {
    return (
      <AppLayout showFooter={false}>
        <div className="pt-20 lg:pt-24 px-4 max-w-2xl mx-auto pb-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showFooter={false}>
      <div className="pt-20 lg:pt-24 px-4 max-w-2xl mx-auto pb-8 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/perfil")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold">Meus Dados</h1>
        </div>

        {/* Foto de Perfil */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-base font-display font-bold flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" /> Foto de Perfil
            </h3>
            <div className="flex items-center gap-4">
               <div className="relative">
                 <EditableAvatar
                   src={previewFoto}
                   fallback="?"
                   size="lg"
                   onFileSelect={(file) => setProfileImageFile(file)}
                 />
                 {isPCD && (
                   <img src={pcdIcon} alt="PCD" className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 border-background bg-background" title="Pessoa com Deficiência" />
                 )}
                 {previewFoto && (
                   <button
                     type="button"
                     onClick={() => { setProfileImageFile(null); setProfileImageUrl(null); }}
                     className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 z-20"
                   >
                     <X className="w-3 h-3" />
                   </button>
                 )}
               </div>
              <p className="text-sm text-muted-foreground">Escolha uma foto profissional e com boa iluminação.</p>
            </div>
          </CardContent>
        </Card>

        {/* Dados de Usuário */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <h3 className="text-base font-display font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Dados de Usuário
            </h3>
            <div className="space-y-2 hidden">
              <Label>Nome Completo</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Número de Celular</Label>
              <Input value={telefone} onChange={(e) => setTelefone(maskPhone(e.target.value))} />
            </div>
          </CardContent>
        </Card>

        {/* Dados de Perfil */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <h3 className="text-base font-display font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Dados de Perfil
            </h3>
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input value={cpf} disabled className="opacity-60 cursor-not-allowed" />
              <p className="text-xs text-muted-foreground">O CPF não pode ser alterado.</p>
            </div>
            <div className="space-y-2">
              <Label>Data de Nascimento</Label>
              <DatePicker value={dataNascimento} onChange={setDataNascimento} />
            </div>
            <div className="space-y-2">
              <Label>Sexo</Label>
              <Select value={sexo} onValueChange={setSexo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                  <SelectItem value="prefiro-nao-dizer">Prefiro não dizer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* PCD */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Necessidade Especial (PCD)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{isPCD ? "Sim" : "Não"}</span>
                  <Switch checked={isPCD} onCheckedChange={setIsPCD} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Endereço */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <h3 className="text-base font-display font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Endereço
            </h3>
            <div className="space-y-2">
              <Label>CEP</Label>
              <Input
                value={cep}
                onChange={(e) => handleCepChange(e.target.value)}
                placeholder="00000-000"
              />
              {cepLoading && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Buscando endereço...
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Rua</Label>
              <Input value={rua} onChange={(e) => setRua(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número</Label>
                <Input value={numero} onChange={(e) => setNumero(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Complemento</Label>
                <Input value={complemento} onChange={(e) => setComplemento(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bairro</Label>
              <Input value={bairro} onChange={(e) => setBairro(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input value={cidade} onChange={(e) => setCidade(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Input value={estado} onChange={(e) => setEstado(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contato de Emergência */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <h3 className="text-base font-display font-bold flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" /> Contato de Emergência
            </h3>
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                placeholder="Nome do contato"
                value={contatoEmergNome}
                onChange={(e) => setContatoEmergNome(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Grau de Parentesco</Label>
              <Select value={contatoEmergParentesco} onValueChange={setContatoEmergParentesco}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {grausParentesco.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>DDD + Número</Label>
              <Input
                placeholder="(00) 00000-0000"
                value={contatoEmergTelefone}
                onChange={(e) => setContatoEmergTelefone(maskPhone(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Chave Pix */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <h3 className="text-base font-display font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" /> Chave Pix
            </h3>
            <div className="space-y-2">
              <Label>Tipo de Chave PIX</Label>
              <Select value={chavePixType} onValueChange={setChavePixType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de chave" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpf">CPF</SelectItem>
                  <SelectItem value="cnpj">CNPJ</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="telefone">Telefone</SelectItem>
                  <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Chave PIX</Label>
              <Input
                placeholder="Informe sua chave PIX"
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
              />
              <p className="text-xs text-muted-foreground italic">
                Sua chave PIX será usada para receber os pagamentos pelos serviços realizados.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <Button onClick={handleSave} className="w-full" size="lg" disabled={saving}>
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
            </span>
          ) : (
            "Salvar Alterações"
          )}
        </Button>

        {/* Apagar Conta */}
        <Card className="border-destructive/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <h3 className="text-sm font-bold text-destructive">Apagar Conta</h3>
                <p className="text-xs text-muted-foreground">
                  Ao solicitar a exclusão, um código será enviado para seu e-mail.
                  Após confirmação, sua conta será apagada em 7 dias, a menos que você faça login novamente.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteDialog(true)}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Solicitar Exclusão
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Apagar Conta */}
      <Dialog open={deleteDialog} onOpenChange={(open) => {
        if (!open) {
          setDeleteDialog(false);
          setCodigoEnviado(false);
          setCodigoOTP("");
          setConfirmadoDelete(false);
        }
      }}>
        <DialogContent className="max-w-sm">
          {confirmadoDelete ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-center">Exclusão Solicitada</DialogTitle>
                <DialogDescription className="text-center">
                  Sua conta será apagada em 7 dias. Se você fizer login novamente nesse período, a exclusão será cancelada automaticamente.
                </DialogDescription>
              </DialogHeader>
            </div>
          ) : !codigoEnviado ? (
            <>
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogDescription>
                  Enviaremos um código de verificação para <strong>{email}</strong> para confirmar a exclusão da sua conta.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancelar</Button>
                <Button variant="destructive" onClick={handleEnviarCodigo}>Enviar Código</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Insira o Código</DialogTitle>
                <DialogDescription>
                  Digite o código de 6 dígitos enviado para {email}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center py-4">
                <InputOTP maxLength={6} value={codigoOTP} onChange={setCodigoOTP}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancelar</Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmarDelete}
                  disabled={codigoOTP.length < 6}
                >
                  Confirmar Exclusão
                </Button>
              </DialogFooter>
            </>
          )}
         </DialogContent>
       </Dialog>
     </AppLayout>
  );
};

export default MeusDados;
