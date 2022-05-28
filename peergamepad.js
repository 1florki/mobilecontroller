/*import 'https://cdn.jsdelivr.net/npm/peerjs@0.3.20/dist/peer.min.js';
*/
class PeerGamepad {
  constructor(opts) {
    opts = opts || {};
    
    this.messages = [];
    
    this.peerID = undefined;
    
    this.connection = undefined;
    
    this.peer = new Peer();
    
    this.onConnect = opts.onConnect;
    
    this.verbose = opts.verbose;
    
    this.peer.on('open', id => { 
      print("connected to key server with id " + id);
      this.peerID = id;
      if(opts.connect) {
        this.connectTo(opts.connect);
      } else {
        let id = PeerGamepad.getIDFromURL();
        if(id) this.connectTo(id);
      }
    });
  }
  
  print(text) {
    if(this.verbose) {
      console.log(text);
    }
  }
  
  
  sendData(data) {
    if(this.connection == undefined || data == undefined) return;
    this.connection.send(data);
  }
  
  static getIDFromURL() {
    let params = new URLSearchParams(location.search);
    return params.get('id');
  }
  
  connectTo(peerID) {
    print("connecting to " + peerID);
    if(this.peerID == peerID) {
      print("ERROR, tried to connect to own id");
      return;
    }
    if(!this.peerID) {
      print("ERROR, not connected to key server yet")
      return;
    }
    
    let conn = this.peer.connect(peerID);
    conn.on('open', () => {
      print("connection successfull")
      this.connection = conn;
      
      if(this.onConnect) {
        this.onConnect(this);
      }
      
      conn.on('data', data => this.receivedData(data)); 
    });
  }
  
  receivedData(data) {
    print(data);
  }
}

class PeerCommander {
  constructor(opts) {
    opts = opts || {};
    
    this.messages = [];
    
    this.peerID = undefined;
    
    this.connections = [];
    
    this.peer = new Peer();
    
    this.url = opts.url;
    
    this.data = {};
    
    this.onData = opts.onData;
    this.onConnected = opts.onConnected;
    this.onQRCodeCreated = opts.onQRCodeCreated;
    
    this.verbose = opts.verbose;
    
    this.peer.on('open', id => { 
      print("connected to key server with id " + id);
      this.peerID = id; 
      if(this.onConnected) {
        this.onConnected(this)
      }
      this.createQRCode();
    });
    
    this.peer.on('connection', conn => {
      this.connections.push(conn);
      conn.on('open', () => { 
        print("opened data connection with " + conn.peer);
        conn.on('data', data => this.receivedData(conn.peer, data)); });
    }); 
  }
  
  print(text) {
    if(this.verbose) {
      console.log(text);
    }
  }
  
  createQRCode() {
    if(this.peerID == undefined) {
      print("unable to create qr code, not connected to key server yet");
      return;
    }
    
    let element = document.getElementById("qrcode");
    if(element == undefined) {
      print("expected element with id 'qrcode' on page, unable to create qrcode")
      return;
    }
    
    let textCode = (this.url || "https://1florki.github.io/mobilecontroller/controller/index.html") + "?id=" + this.peerID;
    let code = new QRCode(element, {text: textCode, correctLevel: QRCode.CorrectLevel.L});
    print(code._el.children[1]);
    print(textCode)
    
    if(this.onQRCodeCreated) {
      this.onQRCodeCreated(this)
    }
  }
  
  receivedData(peer, data) {
    this.data[peer] = data;
    if(this.onData) {
      this.onData(this.data);
    }
  }
  
  showData(id) {
    let info = "";
    for(let k of Object.keys(this.data)) {
      info += k + ": [";
      let arr = this.data[k];
      for(let a of arr) {
        info += "{";
        for(let k of Object.keys(a)) {
          info += k + ": " + a[k] + ", ";
        }
        info += "}, ";
      }
      info += "],<br>";
    }
    
    document.getElementById(id || "data").innerHTML = info;
  }
}
