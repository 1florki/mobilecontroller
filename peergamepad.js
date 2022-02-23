/*import 'https://cdn.jsdelivr.net/npm/peerjs@0.3.20/dist/peer.min.js';
*/
const PEER_SERVER_KEY = 'lwjd5qra8257b9';

class PeerGamepad {
  constructor(opts) {
    opts = opts || {};
    
    this.messages = [];
    
    this.peerID = undefined;
    
    this.connection = undefined;
    
    this.peer = new Peer({key: PEER_SERVER_KEY});
    
    this.onConnect = opts.onConnect;
    
    this.peer.on('open', id => { 
      console.log("connected to key server with id " + id);
      this.peerID = id;
      if(opts.connect) {
        this.connectTo(opts.connect);
      } else {
        let id = PeerGamepad.getIDFromURL();
        if(id) this.connectTo(id);
      }
    });
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
    console.log("connecting to " + peerID);
    if(this.peerID == peerID) {
      console.log("ERROR, tried to connect to own id");
      return;
    }
    if(!this.peerID) {
      console.log("ERROR, not connected to key server yet")
      return;
    }
    
    let conn = this.peer.connect(peerID);
    conn.on('open', () => {
      console.log("connection successfull")
      this.connection = conn;
      
      if(this.onConnect) {
        this.onConnect(this);
      }
      
      conn.on('data', data => this.receivedData(data)); 
    });
  }
  
  receivedData(data) {
    console.log(data);
  }
}


class PeerCommander {
  constructor(opts) {
    opts = opts || {};
    
    this.messages = [];
    
    this.peerID = undefined;
    
    this.connections = [];
    
    this.peer = new Peer({key: PEER_SERVER_KEY});
    
    this.url = opts.url;
    
    this.data = {};
    
    this.onData = opts.onData;
    
    this.peer.on('open', id => { 
      console.log("connected to key server with id " + id);
      this.peerID = id; 
      this.createQRCode();
    });
    
    this.peer.on('connection', conn => {
      this.connections.push(conn);
      conn.on('open', () => { 
        console.log("opened data connection with " + conn.peer);
        conn.on('data', data => this.receivedData(conn.peer, data)); });
    }); 
  }
  
  createQRCode() {
    if(this.peerID == undefined) {
      console.log("unable to create qr code, not connected to key server yet");
      return;
    }
    
    let element = document.getElementById("qrcode");
    if(element == undefined) {
      console.log("expected element with id 'qrcode' on page, unable to create qrcode")
      return;
    }
    
    let textCode = (this.url || "") + "?id=" + this.peerID;
    let code = new QRCode(element, textCode);
    console.log(code._el.children[1]);
    console.log(textCode)
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