'use strict';

(() => { // 即時関数で囲う

  class ClockDrawer { // 描画関連の処理
    constructor(canvas) { // 時計を描画するcanvas要素を切り替えられるように引数に渡す
      this.ctx = canvas.getContext('2d'); // 描画コンテキスト
      // canvasの幅と高さを取得しておく（後で描画しやすい）
      this.width = canvas.width;
      this.height = canvas.height;
    }

    draw(angle, func) {
      this.ctx.save(); // 次のループに移る際に座標空間を戻したい

      this.ctx.translate(this.width / 2, this.height / 2); // 原点の移動（canvasの中心）
      // this.rotate(2 * Math.PI / 360 * angle); 約分できる↓
      this.ctx.rotate(Math.PI / 180 * angle); //angleの分だけ回転しつつ線を書く

      this.ctx.beginPath(); //パスのリセット
      func(this.ctx);
      this.ctx.stroke(); // 線を書く

      this.ctx.restore(); // 次のループに移る際に座標空間を戻したい
    }
    // canvas全体をクリアするメソッド
    clear() {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  class Clock { // クラスの定義
    constructor(drawer) { // オブジェクト生成の関数
      this.r = 100; // 半径100
      this.drawer = drawer;
    }


    drawFace() {

      // 盤面の短い目盛りの描画
      for (let angle = 0; angle < 360; angle += 6) { // 0度開始 6度ずつ増 360度までループ
        this.drawer.draw(angle, ctx => {
          ctx.moveTo(0, -this.r); // 開始位置を真上に半径分移動
          if (angle % 30 === 0) { // 角度が30度の時に太い目盛り
            ctx.lineWidth = 2; // 太さ2
            ctx.lineTo(0, -this.r +10); // 下に10px線を引く(xは0、ｙ座標に10足す)
            // 時間の数字
            ctx.font = '13px Ariel';
            ctx.textAlign = 'center';
            ctx.fillText(angle / 30 || 12, 0, -this.r + 25); // 角度→太目盛と同じ 位置→半径の箇所から25下 0→falseになるのでfalseだったら12にすることで12時を描画できる
          } else { //角度30度以外→短い目盛り
            ctx.lineTo(0, -this.r + 5); // 下に5px線を引く(xは0、ｙ座標に5足す)
          }
        });
      }
    }

    drawHands() {
      // hour 時針の描画
      this.drawer.draw(this.h * 30 + this.m * 0.5, ctx => { // 1分で0.5度移動＝1時間で30度
        ctx.lineWidth = 6; // 太さ
        ctx.moveTo(0, 10); // 中心から少し下の位置
        ctx.lineTo(0, -this.r + 50); // 半径だけ上にいったあと50px分下がった位置
      });

      // minute 分針の描画
      this.drawer.draw(this.m * 6, ctx => { // 渡す角度は分に6度をかける
        ctx.lineWidth = 4; // 太さ
        ctx.moveTo(0, 10); // 中心から少し下の位置
        ctx.lineTo(0, -this.r + 30); // 半径だけ上にいったあと30px分下がった位置
      })

      // socond 秒針の描画
      this.drawer.draw(this.s * 6, ctx => { // 渡す角度は秒に6度をかける
        ctx.strokeStyle = 'red'; // 針の色
        ctx.moveTo(0, 20); // 他の針よりも中心から少し下の位置から
        ctx.lineTo(0, -this.r + 20); // 半径だけ上にいって30px分下の位置（数字にかかる所までの長さ）
      })
    }

    // 現在時刻の取得
    update() {
      this.h = (new Date()).getHours();
      this.m = (new Date()).getMinutes();
      this.s = (new Date()).getSeconds();
    }

    run() { // 実行
      this.update(); // 現在時刻の更新

      this.drawer.clear(); // canvasのクリア（秒針が毎秒画面に残るため）
      this.drawFace(); // 盤面描画
      this.drawHands(); // 針の描画
      // 時計をリアルタイムに動かす
      setTimeout(() => { // runメソッドを再帰的に実行
        this.run();
      }, 100); // 100ミリ秒後
    }
  }

    const canvas = document.querySelector('canvas'); // canvas取得
    // ブラウザがcanvasをサポートしてない時は処理を止める
    if (typeof canvas.getContext === 'undefined') { //canvasのgetContextが定義されてるか
      return; // されてなければreturn 即時関数が必要
    }

  const clock = new Clock(new ClockDrawer(canvas));
  clock.run(); // 時計を動かす

})();