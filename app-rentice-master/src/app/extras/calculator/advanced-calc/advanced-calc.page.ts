import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-advanced-calc',
  templateUrl: './advanced-calc.page.html',
  styleUrls: ['./advanced-calc.page.scss'],
})
export class AdvancedCalcPage implements OnInit {
  result = "";
  constructor() { }

  ngOnInit() {
  }

  btnClicked(btn) {
      console.log('CalculatorPage::btnClicked = ' + btn);
      if (btn == "C") {
          this.result = "";
      } else if (btn == "=") {
          this.result = eval(this.result);
      } else if (btn == "squareroot") {
          this.result = Math.sqrt(eval(this.result)) + "";
      } else if (btn == "square") {
          this.result = eval("(" + this.result + ") * ( " + this.result + ")");
      } else if (btn == "reciproc") {
          this.result = eval(1 + "/ (" + this.result + ")");
      } else {
          this.result += btn;
      }
  }

  openUrl(url) {
    window.open(url,  '_blank');
  }

}