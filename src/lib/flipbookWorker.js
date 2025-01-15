// flipbookWorker.js
self.onmessage = function (e) {
    // console.log("Do i work")
    // const { flipbookLength, productImageEnterSpeed } = e.data;
    self.postMessage({ index: 0 });
    // let i = 0;
    // const interval = setInterval(() => {
    //   if (i < flipbookLength) {
    //     self.postMessage({ index: i });
    //     i++;
    //   } else {
    //     clearInterval(interval);
    //     self.postMessage({ done: true });
    //   }
    // }, productImageEnterSpeed);
  };
  