//usless shit
class Loader {
  constructor(startText, endText) {
    this.startText = startText;
    this.endText = endText;
    this.dotsCount = 1;
    this.intervalId = null;
  }

  // Metodo per avviare la stampa
  startLoading() {
    this.intervalId = setInterval(() => {
      this.dotsCount = (this.dotsCount % 3) + 1;
      this.printDownloadingText();
    }, 1000);

    this.printDownloadingText();
  }

  // Metodo per fermare la stampa
  stopLoading() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      console.log(`${this.startText}... ${this.endText}`);
    }
  }

  // Metodo per stampare il testo con i puntini
  printDownloadingText() {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`${this.startText}${'.'.repeat(this.dotsCount)}`);
  }
}

module.exports = Loader;
