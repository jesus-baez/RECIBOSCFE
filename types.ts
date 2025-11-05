export interface BillingDataRow {
  Periodo: string;
  Demanda: string;
  'Consumo Total': string;
  'Factor de potencia': string;
  'Factor de Carga': string;
  'Precio Medio': string;
}

export interface ExtractedTable {
  fileName: string;
  data: BillingDataRow[];
}
