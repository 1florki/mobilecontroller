class PeerGamepad {
  constructor(opts) {
    opts = opts || {};
    
    this.messages = [];
    
    this.peerID = undefined;
    
    this.connection = undefined;
    
    this.peer = new Peer();
    
    this.onConnect = opts.onConnect;
    this.onData = opts.onData;
    
    this.verbose = opts.verbose;
    
    this.peer.on('open', id => { 
      this.log("connected to key server with id " + id);
      this.peerID = id;
      if(opts.connect) {
        this.connectTo(opts.connect);
      } else {
        let id = PeerGamepad.getIDFromURL();
        if(id) this.connectTo(id);
      }
    });
  }
  
  log(text) {
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
    this.log("connecting to " + peerID);
    if(this.peerID == peerID) {
      this.log("ERROR, tried to connect to own id");
      return;
    }
    if(!this.peerID) {
      this.log("ERROR, not connected to key server yet")
      return;
    }
    
    let conn = this.peer.connect(peerID);
    conn.on('open', () => {
      this.log("connection successfull")
      this.connection = conn;
      
      if(this.onConnect) {
        this.onConnect(this);
      }
      
      conn.on('data', data => this.receivedData(data)); 
    });
  }
  
  receivedData(data) {
    this.log(data);
    if(this.onData) {
      this.onData(data);
    }
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
    this.onGamepadConnected = opts.onGamepadConnected;
    
    this.verbose = opts.verbose;
    
    this.peer.on('open', id => { 
      this.log("connected to key server with id " + id);
      this.peerID = id; 
      if(this.onConnected) {
        this.onConnected(this)
      }
      this.createQRCode();
    });
    
    this.peer.on('connection', conn => {
      this.connections.push(conn);
      conn.on('open', () => { 
        this.log("opened data connection with " + conn.peer);
        if(this.onGamepadConnected) {
          this.onGamepadConnected(this, conn)
        }
        conn.on('data', data => this.receivedData(conn.peer, data)); });
    }); 
  }
  
  log(text) {
    if(this.verbose) {
      console.log(text);
    }
  }
  
  sendData(connection, data) {
    connection.send(data)
  }
  
  changeColor(connection, color) {
    this.sendData(connection, {color: color})
  }
  
  createQRCode() {
    if(this.peerID == undefined) {
      this.log("unable to create qr code, not connected to key server yet");
      return;
    }
    
    let element = document.getElementById("qrcode");
    if(element == undefined) {
      this.log("expected element with id 'qrcode' on page, unable to create qrcode")
      return;
    }
    
    let textCode = (this.url || "https://1florki.github.io/mobilecontroller/controller/index.html") + "?id=" + this.peerID;
    let code = new QRCode(element, {text: textCode, correctLevel: QRCode.CorrectLevel.L});
    this.log(code._el.children[1]);
    this.log(textCode)
    
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
