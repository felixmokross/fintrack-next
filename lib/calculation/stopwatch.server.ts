export class Stopwatch {
  private startTime: [number, number] | null = null;

  private leap(): string {
    if (!this.startTime) throw new Error("Stopwatch hasn't been started yet!");

    const [seconds, nanoseconds] = process.hrtime(this.startTime);
    this.initialize();

    return `${seconds}s ${nanoseconds / 1_000_000}ms`;
  }

  public logStart(): void {
    if (this.startTime) throw new Error("Stopwatch has already been started!");

    console.log("stopwatch start");
    this.initialize();
  }

  public logLeap(): void {
    console.log(`    ${this.leap()}`);
  }

  public logStop(): void {
    this.logLeap();
    this.startTime = null;
    console.log("stopwatch stopped");
  }

  private initialize(): void {
    this.startTime = process.hrtime();
  }
}
