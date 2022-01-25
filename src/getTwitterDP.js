import React, { useState } from "react";
import metadata from "./metadata.js";
import { TextField, Button, Snackbar } from "@mui/material";
import "./App.css";

const ipfsAPI = require("ipfs-api");
const ipfs = ipfsAPI("ipfs.infura.io", "5001", { protocol: "https" });

const INFURA_HTTPS = "https://ipfs.infura.io/ipfs/";

/**
 * By Ken Fyrstenberg Nilsen
 *
 * drawImageProp(context, image [, x, y, width, height [,offsetX, offsetY]])
 *
 * If image and context are only arguments rectangle will equal canvas
 */
function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {
  if (arguments.length === 2) {
    x = y = 0;
    w = ctx.canvas.width;
    h = ctx.canvas.height;
  }

  // default offset is center
  offsetX = typeof offsetX === "number" ? offsetX : 0.5;
  offsetY = typeof offsetY === "number" ? offsetY : 0.5;

  // keep bounds [0.0, 1.0]
  if (offsetX < 0) offsetX = 0;
  if (offsetY < 0) offsetY = 0;
  if (offsetX > 1) offsetX = 1;
  if (offsetY > 1) offsetY = 1;

  var iw = img.width,
    ih = img.height,
    r = Math.min(w / iw, h / ih),
    nw = iw * r, // new prop. width
    nh = ih * r, // new prop. height
    cx,
    cy,
    cw,
    ch,
    ar = 1;

  // decide which gap to fill
  if (nw < w) ar = w / nw;
  if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh; // updated
  nw *= ar;
  nh *= ar;

  // calc source rectangle
  cw = iw / (nw / w);
  ch = ih / (nh / h);

  cx = (iw - cw) * offsetX;
  cy = (ih - ch) * offsetY;

  // make sure source rectangle is valid
  if (cx < 0) cx = 0;
  if (cy < 0) cy = 0;
  if (cw > iw) cw = iw;
  if (ch > ih) ch = ih;

  // fill image in dest. rectangle
  ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}



const CanvasComponent = ({ deployedContract, account }) => {
  const [profile, setProfile] = useState("");
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState(false)

  const Draw = function (url) {
    var c = document.getElementById("myCanvas");
  
    var ctx = c.getContext("2d");
  
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, c.width, c.height);
  
    ctx.scale(2.5, 2.5);
    let p = new Path2D(
      "M193.248 69.51C185.95 54.1634 177.44 39.4234 167.798 25.43L164.688 20.96C160.859 15.4049 155.841 10.7724 149.998 7.3994C144.155 4.02636 137.633 1.99743 130.908 1.46004L125.448 1.02004C108.508 -0.340012 91.4873 -0.340012 74.5479 1.02004L69.0879 1.46004C62.3625 1.99743 55.8413 4.02636 49.9981 7.3994C44.155 10.7724 39.1367 15.4049 35.3079 20.96L32.1979 25.47C22.5561 39.4634 14.0458 54.2034 6.74789 69.55L4.39789 74.49C1.50233 80.5829 0 87.2441 0 93.99C0 100.736 1.50233 107.397 4.39789 113.49L6.74789 118.43C14.0458 133.777 22.5561 148.517 32.1979 162.51L35.3079 167.02C39.1367 172.575 44.155 177.208 49.9981 180.581C55.8413 183.954 62.3625 185.983 69.0879 186.52L74.5479 186.96C91.4873 188.32 108.508 188.32 125.448 186.96L130.908 186.52C137.638 185.976 144.163 183.938 150.006 180.554C155.85 177.17 160.865 172.526 164.688 166.96L167.798 162.45C177.44 148.457 185.95 133.717 193.248 118.37L195.598 113.43C198.493 107.337 199.996 100.676 199.996 93.93C199.996 87.1841 198.493 80.5229 195.598 74.43L193.248 69.51Z"
    );
    ctx.translate(0, 6);
    //ctx.fill(p)
  
    ctx.clip(p);
    ctx.scale(1, 1);
    var img = new Image(); // Create new img element
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url; // Set source path
  
    img.addEventListener(
      "load",
      function () {
        setOpen(true)
        setMessage("Fetched Image")
        document.getElementById("mint").style.display = "block";
        // execute drawImage statements here
        drawImageProp(ctx, img, 0, 0, 200, 200);
      },
      false
    );
  };
  
  const download = async () => {
    Draw("https://unavatar.io/twitter/" + profile, );
  };

  const downloadNft = async () => {
    const dataUrl = document.getElementById("myCanvas").toDataURL();
    const buffer = Buffer(dataUrl.split(",")[1], "base64");
    console.log(buffer);
    ipfs.files.add(buffer, (error, result) => {
      if (result) {
        metadata.name = profile;
        metadata.image = INFURA_HTTPS + result[0].hash;
        console.log("image uploaded to IPFS image URI:" + metadata.image);
        console.log(metadata);
        let metadataBuffer = Buffer.from(JSON.stringify(metadata));
        ipfs.files.add(metadataBuffer, (error, secondResult) => {
          if (secondResult) {
            const tokenURI = INFURA_HTTPS + secondResult[0].hash;
            console.log(
              "Metadata uploaded to IPFS image as JSON URI:" + tokenURI
            );
            deployedContract.methods
              .createCollectible(tokenURI)
              .send({ from: account })
              .on("transactionHash", (hash) => {
                setOpen(true)
                setMessage("NFT Deployed")
                console.log("success, transction hash: ", hash);
              });
          }
          if (error) {
            console.log(error);
            setOpen(true)
            setMessage("There was some error")
          }
        });
      }
      if (error) {
        console.log(error);
      }
    });
  };

  const handleClose = () => {
      setOpen(false)
  }

  return (
    <div>
      <div className="group">
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        message={message}
      />
        <TextField
          width="md"
          label="Twitter handle"
          placeholder="Enter your Twitter handle"
          value={profile}
          onInput={(e) => setProfile(e.target.value)}
        />
        <Button variant="outlined" onClick={download}>
          Get my DP
        </Button>
      </div>
      <div width="500px" height="500px">
        <canvas id="myCanvas" width="500" height="500"></canvas>
      </div>
      <div className="group">
        <Button
          id="mint"
          style={{ display: "none" }}
          variant="outlined"
          onClick={downloadNft}
        >
          Mint NFT
        </Button>
      </div>
    </div>
  );
};

export default CanvasComponent;
