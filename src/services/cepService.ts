export interface Address {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export class CepNotFoundError extends Error {
  constructor() {
    super("CEP não encontrado.");
    this.name = "CepNotFoundError";
  }
}

interface ViaCepResponse {
  erro?: boolean | string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
}

interface BrasilApiResponse {
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

const cache = new Map<string, Address>();

async function fromViaCep(cep: string, signal?: AbortSignal): Promise<Address> {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal });
  if (!response.ok) throw new Error(`ViaCEP respondeu ${response.status}`);

  const data: ViaCepResponse = await response.json();
  if (data.erro) throw new CepNotFoundError();

  return {
    street: data.logradouro ?? "",
    neighborhood: data.bairro ?? "",
    city: data.localidade ?? "",
    state: data.uf ?? "",
  };
}

async function fromBrasilApi(cep: string, signal?: AbortSignal): Promise<Address> {
  const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`, { signal });
  if (response.status === 404) throw new CepNotFoundError();
  if (!response.ok) throw new Error(`BrasilAPI respondeu ${response.status}`);

  const data: BrasilApiResponse = await response.json();
  return {
    street: data.street ?? "",
    neighborhood: data.neighborhood ?? "",
    city: data.city ?? "",
    state: data.state ?? "",
  };
}

export async function lookupCep(cep: string, signal?: AbortSignal): Promise<Address> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) throw new Error("CEP inválido");

  const cached = cache.get(digits);
  if (cached) return cached;

  let address: Address;
  try {
    address = await fromViaCep(digits, signal);
  } catch (error) {
    // CEP inexistente ou consulta cancelada: não adianta tentar outro serviço
    if (error instanceof CepNotFoundError || signal?.aborted) throw error;
    address = await fromBrasilApi(digits, signal);
  }

  cache.set(digits, address);
  return address;
}