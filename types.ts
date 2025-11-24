export interface MeasurementData {
  receptionNumber: string;
  inspectionDateStart: string;
  inspectionDateEnd: string;
  model: string;
  serialNumber: string;
  spanFilm: string;
  intermediateFilm: string;
  span1: string;
  flowRate: string;
  repeatability1: string;
  linearity: string;
  repeatability2: string;
  blankTest1: string;
  repeatability3: string;
  blankTest2: string;
  span2: string;
  blankTest3: string;
}

export interface Sheet {
  id: string;
  name: string;
  data: MeasurementData;
  files: File[];
}

export type MeasurementField = keyof MeasurementData;