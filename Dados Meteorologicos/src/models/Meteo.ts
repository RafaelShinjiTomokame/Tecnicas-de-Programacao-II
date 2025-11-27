export class Meteo {
  constructor(
    public date: string,
    public time: string,
    public tempC: number,
    public humPct: number,
    public pressBar: number,
    public tempCabineC: number,
    public charge: number,
    public srWm2: number,
    public windPeakMs: number,
    public windSpeedInst: number,
    public windSpeedAvg: number,
    public windDirInst: number,
    public windDirAvg: number
  ) {}
}
