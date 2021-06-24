
const functions = require("firebase-functions");
const axios = require('axios');
const express = require("express");
const cors = require('cors');

const app = express();
app.use(cors({ origin: true }));

const FANTASY_DATA_KEY = process.env.FANTASY_DATA_KEY;

app.get("/players/:playerId", async (req, res)=> {
  
  let playerData = [];
  let otherRes = await axios.get(`http://fly.sportsdata.io/v3/nfl/stats/json/PlayerSeasonStats/2020REG?key=${FANTASY_DATA_KEY}`);

  
  otherRes.data.forEach(element => {

      if(element.FantasyPointsFantasyDraft != 0.0 || element.FantasyPointsYahoo != 0.0 || element.FantasyPointsDraftKings != 0.0 || element.FantasyPointsFanDuel != 0.0 ){
        
        //get average of non zero values
        let average = 0;
        let numberOfNonZeroFP = 0;
        for(let i=0; i<4 ; i++){
          if(element.FantasyPointsFantasyDraft != 0.0 ){
            average += element.FantasyPointsFantasyDraft;
            numberOfNonZeroFP++;
          }
          if(element.FantasyPointsYahoo != 0.0 ){
            average += element.FantasyPointsYahoo;
            numberOfNonZeroFP++;
          }
          if(element.FantasyPointsDraftKings != 0.0 ){
            average += element.FantasyPointsDraftKings;
            numberOfNonZeroFP++;
          }
          if(element.FantasyPointsFanDuel != 0.0 ){
            average += element.FantasyPointsFanDuel;
            numberOfNonZeroFP++;
          }
        }
        average = average/numberOfNonZeroFP; 

        playerData.push({playerId:element.PlayerID, averageFPs:average });
        
      }

    }

  );

  //order player data by decsending average points
  playerData.sort((a, b) => parseFloat(b.averageFPs) - parseFloat(a.averageFPs));


  //let result = JSON.stringify(playerData[1]);
  let result = "";
  for(let i = 0; i< playerData.length; i++){
    if(playerData[i].playerId == req.params.playerId){
      //result = i + 1; //returns 1 + position in array AKA player rank
      result = Number(Number(playerData[i].averageFPs) * 1000000).toFixed(0) ;
    }
  }

  //result = JSON.stringify(playerData[0]);
  res.send(result.toString());

  //res.send();
});

exports.app = functions.https.onRequest(app);



