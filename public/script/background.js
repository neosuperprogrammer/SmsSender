
var seq = 0;

function changeBG() {

  var bgUrl = [
    "url(https://images.unsplash.com/photo-1433360405326-e50f909805b3?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&w=1080&fit=max&s=359e8e12304ffa04a38627a157fc3362)",
    "url(https://images.unsplash.com/photo-1433190152045-5a94184895da?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&w=1080&fit=max&s=57115141c5d099ff83a0aa55c0b219a9)",
    "url(https://images.unsplash.com/photo-1423768164017-3f27c066407f?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&w=1080&fit=max&s=712b919f3a2f6fc34f29040e8082b6d9)",
    "url(https://images.unsplash.com/photo-1454817481404-7e84c1b73b4a?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&w=1080&fit=max&s=754ba511edc0c5a70d72bb11f399aec2)",
    "url(https://images.unsplash.com/photo-1440557653082-e8e186733eeb?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&w=1080&fit=max&s=c3e33a77ab6df4ba68994c8d785cbb58)",

  ];


  if (seq == bgUrl.length) {
    seq = 0;
  }
  $('body').css("background-image", bgUrl[seq]);

  seq++;
}

setInterval(changeBG, 5000);
