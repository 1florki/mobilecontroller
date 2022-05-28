## Mobile Controller

use your phone as a mobile controller for your webgame. 

Powered using [peer.js](https://github.com/peers/peerjs) and [qrcode.js](https://github.com/davidshimjs/qrcodejs).


### Usage

#### use default controller

##### 1. Create a hidden div with id = "qrcode"

```html
<div id="qrcode" style="display: none;"></div>
```

##### 2. import Peer.js, QRCode.js, and peergamepad.js from this repository.

```javascript
<script src="https://unpkg.com/peerjs@1.3.2/dist/peerjs.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/davidshimjs-qrcodejs@0.0.2/qrcode.min.js"></script>
<script src="https://1florki.github.io/mobilecontroller/peergamepad.js"></script>
```

##### 3. Create a PeerCommander object with a corresponding url (use of url shortener recommended) and a callback.

```javascript
var master = new PeerCommander({url: "https://tinyurl.com/3dy3srvc", onQRCodeCreated: (master) => {
  // code to show qr code here...
}});
```

##### 4. Use your PeerCommander object to read controller values by looking at .data dictionary (key == id of gamepad).

For example:

```javascript
// get first connected gamepad
let gamepad = master.data[Object.keys(master.data)[0]];

let move = gamepad[0]; // joystick, contains x and y between [-1, 1]
let jump = gamepad[1].pressed; // boolean for simple button
let shoot = gamepad[2].pressed;

// move your player...
```