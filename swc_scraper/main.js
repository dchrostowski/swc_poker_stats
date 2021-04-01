const puppeteer = require('puppeteer')
var fs = require('fs')
const util = require('util');
const { TournamentResult, PlayerPosition } = require('./db_models.js')
const db = require('./db.js')


const writeFile = util.promisify(fs.writeFile)

const createPlayerRecord = (playerName, position, prize1, prize2) => {

  return new PlayerPosition({
    playerName: playerName,
    position: position,
    prize1: prize1,
    prize2: prize2,
    totalPrize: prize1 + prize2
  })
}

const createTournamentRecord = (tid, tname, startDateString, endDateString, players) => {

  return new TournamentResult({
    tournamentId: tid,
    tournamentName: tname,
    startDate: new Date(startDateString),
    endDate: new Date(endDateString),
    results: players
  })
}

const insertRecord = (tournamentRecord) => {
  debugger
  tournamentRecord.save(function (err) {
    if (err) {
      if (err.code == 11000) {
        console.log(`duplicate tournament id for ${tournamentRecord.tournamentId}.  Ignoring.`)
      }
      else {
        console.error(err)
      }

    }
    else {
      console.log(`Successfully inserted tournament record for ${tournamentRecord.tournamentName}`)
    }
  })
}

const findUpdate = async () => {
  const filter = { tournamentId: 85238707 }
  const player1 = new PlayerPosition({ playerName: 'dan', position: 2, prize1: 1000, totalPrize: 1000 })
  const player2 = new PlayerPosition({ playerName: 'cloud', position: 1, prize1: 2000, totalPrize: 2000 })
  const newData = [player1, player2]

  const result = await TournamentResult.findOne(filter)
  console.log(result)
  if (result.results.length < newData.length) {
    await TournamentResult.findOneAndUpdate(filter, { results: newData })
    console.log(`Updated tournament ${result.tournamentName} (${result.tournamentId}) `)
  }



}

const insertRecord_test = (tournamentInfo, playerRankings) => {
  console.log("insert record")
  const player1 = new PlayerPosition({
    playerName: 'dan', position: 2, prize1: 1000, totalPrize: 1000
  })

  const player2 = new PlayerPosition({ playerName: 'cloud', position: 1, prize1: 2000, totalPrize: 2000 })

  const players = [player1, player2]

  const tournamentResult = new TournamentResult({
    tournamentId: 3,
    tournamentName: "NLH for Cats 3K GTD",
    startDate: new Date('2021-03-31T06:00:00'),
    endDate: new Date('2021-03-31T09:00:00'),
    results: players
  })



  tournamentResult.save(function (err) {
    if (err) {
      if (err.code == 11000) {
        console.log("duplicate key error, ignoring")
      }
      else {
        console.error(err)
      }

    }

    else {
      console.log(`successfully inserted record for ${tournamentResult.tournamentName}`)
    }
  })

}

const waitFor = async (timeToWait) => {
  return new Promise((resolve) => {
    //console.log("Waiting ", timeToWait / 1000, " seconds...")
    setTimeout(() => {
      resolve()
    }, timeToWait)

  })
}

const main = async (getCompleted) => {

  const printRequest = response => console.log('request: ', response);


  const parseResponse = (async (response) => {
    //console.log(response)
    response = response.response

    let jsonMatch = response.payloadData.match(/^42\/poker\/,(.+)$/)
    let jsonData1
    let jsonData2


    if (jsonMatch) {
      jsonData1 = JSON.parse(jsonMatch[1])
      jsonData2 = JSON.parse(jsonData1[1])
      if (jsonData2.hasOwnProperty('t') && jsonData2['t'] === 'LobbyTournamentInfo') {
        let tourneyName = jsonData2.info.n
        if (!tourneyName) return
        if (jsonData2.tables.length > 0) return
        const dbPlayerList = []

        if (!this.tournamentAndPlayers.hasOwnProperty(tourneyName)) {
          this.tournamentAndPlayers[tourneyName] = {}
        }

        let rawPlayers = jsonData2.players

        console.log("----------------------", tourneyName, "-------------------------")


        for (let i = 0; i < rawPlayers.length; i++) {
          let player = rawPlayers[i]

          let playerName = player['player-nick']
          let place = player['place'] + 1
          let chips = player['cash']
          let expectedPlace = player['expected-place'] + 1
          let playerRate = player['player-rate']
          let isPro = player['pro']
          let mainPrize = player['main-prize-amount'] / 100
          let secondPrize = player['second-prize-amount'] / 100


          console.log("PLAYER POSITION:")
          console.log(playerName)
          console.log(place)
          
          if(place === 0) {
            console.log("bad data, try again.")
            return
          }
          const playerRecord = createPlayerRecord(playerName, place, mainPrize, secondPrize)
          dbPlayerList.push(playerRecord)


        }
        console.log("---------------------------------------------------------------------")
        const dbSortedPlayerList = dbPlayerList.sort((a, b) => (a.position > b.position ? 1 : -1))
        const dbTournamentRecord = createTournamentRecord(jsonData2.info.i, jsonData2.info.n, jsonData2.info.sd, jsonData2.info.le, dbSortedPlayerList)
        insertRecord(dbTournamentRecord)

        


      }
    }
  })

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  try {
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    })

    this.tournamentAndPlayers = {}

    console.log("Loading play.swcpoker.club...")
    await page.goto('https://play.swcpoker.club', { waitUntil: 'networkidle0', timeout: 60000 })
    const [signin, forgot, signup, cancel] = await page.$x('//div[@class="simple-button-content"]')
    console.log("Navigating to lobby...")
    await cancel.click()
    await waitFor(400)

    const [lobby_div] = await page.$x('//div[@class="navigation-panel-back-content"]')
    await lobby_div.click()
    await waitFor(4000)


    const [tournaments_btn] = await page.$x('//div[@class="menu-item-content" and text()="Tournaments"]')
    await tournaments_btn.click()
    await waitFor(5000)

    const runningDivs = await page.$x('//div[@class="panel tournament-line running"]')
    const latRegDivs = await page.$x('//div[@class="panel tournament-line late-registration running"]')

    const tournamentDivs = runningDivs.concat(latRegDivs)

    const cdp = await page.target().createCDPSession();
    await cdp.send('Network.enable');
    await cdp.send('Page.enable');

    cdp.on('Network.webSocketFrameReceived', parseResponse); // Fired when WebSocket message is received.
    cdp.on('Network.webSocketFrameSent', printRequest);

    for (let i = 0; i < tournamentDivs.length; i++) {
      let refreshRunning = await page.$x('//div[@class="panel tournament-line running"]')
      let refreshLateReg = await page.$x('//div[@class="panel tournament-line late-registration running"]')

      let refreshDivs = refreshRunning.concat(refreshLateReg)
      let div = refreshDivs[i]
      await div.click()
      await waitFor(5000)
      let [backButton] = await page.$x('//div[@class="navigation-panel-back-content"]')
      await backButton.click()
      await waitFor(5000)

    }


    if (getCompleted) {
      let [statusButton] = await page.$x('//div[@class="tournament-list-header"]/div[contains(@class,"tournament-status")]')
      await statusButton.click()
      await waitFor(5000)
      await statusButton.click()
      await waitFor(5000)
      const completedDivs = await page.$x('//div[@class="tournaments"]//div[@class="panel tournament-line completed"]')

      for (let i = 0; i < completedDivs.length; i++) {
        let refreshCompleted = await page.$x('//div[@class="tournaments"]//div[@class="panel tournament-line completed"]')
        let div = refreshCompleted[i]
        await div.click()
        await waitFor(5000)
        let [backButton] = await page.$x('//div[@class="navigation-panel-back-content"]')
        await backButton.click()
        await waitFor(2500)

      }

    }

    let tournamentKeys = Object.keys(this.tournamentAndPlayers)
    sortedRankings = {}

    for (let i = 0; i < tournamentKeys.length; i++) {
      let unsorted = []
      let currTournament = this.tournamentAndPlayers[tournamentKeys[i]]
      let playerKeys = Object.keys(currTournament)
      let completed = false
      for (let j = 0; j < playerKeys.length; j++) {

        let playerData = currTournament[playerKeys[j]]
        if (playerData.prize > 0 && !playerData.chips) {
          completed = true
        }
        playerData['playerName'] = playerKeys[j]
        simplifiedPlayerData = { 'playerName': playerKeys[j], 'position': playerData.position, 'chips': playerData.chips, 'prize': playerData.prize }
        unsorted.push(simplifiedPlayerData)
      }
      let sorted = unsorted.sort((a, b) => (a.position > b.position ? 1 : -1))
      for (let k = 0; k < sorted.length; k++) {
        let entry = sorted[k]
        //if (completed) delete entry.chips
        //else delete entry.prize
        sorted[k] = entry
      }

      sortedRankings[tournamentKeys[i]] = sorted

    }
    if (getCompleted) {
      await writeFile('./sortedRankingsCompleted.json', JSON.stringify(sortedRankings))
    }
    else {
      await writeFile('./sortedRankings.json', JSON.stringify(sortedRankings))

    }
    await writeFile('./tournamentRankings.json', JSON.stringify(this.tournamentAndPlayers))


  }
  catch (err) {
    console.error(err)
  }
  finally {
    await page.close()
    await browser.close()
  }





}

const runContinuously = async function () {
  console.log(1)
  let getCompleted = true

  while (true) {
    await main(getCompleted)

  }
}


runContinuously()
//insertRecord()
//findUpdate()
//main()


