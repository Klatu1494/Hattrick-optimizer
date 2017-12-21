const GK = 0;
const CD = 1;
const OCD = 2;
const CDTL = 3;
const LD = 4;
const OLD = 5;
const DLD = 6;
const LDTM = 7;
const MF = 8;
const OMF = 9;
const DMF = 10;
const MFTL = 11;
const W = 12;
const OW = 13;
const DW = 14;
const WTM = 15;
const ST = 16;
const DST = 17;
const STTL = 18;

class Formation {
  constructor(positions) {
    this.positions = positions;
  }

  isValid() {
    function count(positions) {
      var accum = 0;
      for (var position of positions) accum += self.positions[position];
      return accum;
    }

    var self = this;
    var CDs = [CD, OCD, CDTL];
    var LDs = [LD, OLD, DLD, LDTM];
    var MFs = [MF, OMF, DMF, MFTL];
    var Ws = [W, OW, DW, WTM];
    var STs = [ST, DST, STTL];
    return count(CDs) + count(LDs) + count(MFs) + count(Ws) + count(STs) === 10;
  }

  alignPlayers(expectedMidfield, expectedLeftDefense, expectedCentralDefense, expectedRightDefense, expectedLeftAttack, expectedCentralAttack, expectedRightAttack) {
    function getPosition(positionsCopy) {
      for (var i = 0; i < positionsCopy.length; i++) {
        if (positionsCopy[i]) {
          positionsCopy[i]--;
          return i;
        }
      }
    }

    function count(positions) {
      var accum = 0;
      for (var position of positions) accum += self.positions[position];
      return accum;
    }

    function switchTeam(i, leftDef, rightDef, leftAtt, rightAtt) {
      if (!self.players[i]) {
        self.leftDefense = leftDef;
        self.rightDefense = rightDef;
        self.leftAttack = leftAtt;
        self.rightAttack = rightAtt;
        var current = self.getValue(expectedMidfield, expectedLeftDefense, expectedCentralDefense, expectedRightDefense, expectedLeftAttack, expectedCentralAttack, expectedRightAttack);
        if (max < current) {
          max = current;
          self.subpositions = []
          for (var player of self.players) {
            self.subpositions.push(player.tempSubposition);
          }
        }
      } else if (CD <= self.asignedPositions[i] && self.asignedPositions[i] <= CDTL || MF <= self.asignedPositions[i] && self.asignedPositions[i] <= MFTL || ST <= self.asignedPositions[i] && self.asignedPositions[i] <= STTL) {
        for (var j = 0; j <= 1; j += 0.5) {
          self.players[i].tempSubposition = j;
          switchTeam(
            i + 1,
            leftDef + j * self.players[i].positions[self.asignedPositions[i]][self.players[i].playersInZone].lateralDefense,
            rightDef + (1 - j) * self.players[i].positions[self.asignedPositions[i]][self.players[i].playersInZone].lateralDefense,
            leftAtt + j * self.players[i].positions[self.asignedPositions[i]][self.players[i].playersInZone].lateralAttack,
            rightAtt + (1 - j) * self.players[i].positions[self.asignedPositions[i]][self.players[i].playersInZone].lateralAttack)
        }
      } else if (LD <= self.asignedPositions[i] && self.asignedPositions[i] <= LDTM || W <= self.asignedPositions[i] && self.asignedPositions[i] <= WTM) {
        for (var j = 0; j <= 1; j++) {
          self.players[i].tempSubposition = j;
          switchTeam(
            i + 1,
            leftDef + j * self.players[i].positions[self.asignedPositions[i]][self.players[i].playersInZone].lateralDefense,
            rightDef + (1 - j) * self.players[i].positions[self.asignedPositions[i]][self.players[i].playersInZone].lateralDefense,
            leftAtt + j * self.players[i].positions[self.asignedPositions[i]][self.players[i].playersInZone].lateralAttack,
            rightAtt + (1 - j) * self.players[i].positions[self.asignedPositions[i]][self.players[i].playersInZone].lateralAttack)
        }
      } else {
        switchTeam(i + 1,
          leftDef + self.players[i].positions[self.asignedPositions[i]][1].lateralDefense / 2,
          rightDef + self.players[i].positions[self.asignedPositions[i]][1].lateralDefense / 2,
          leftAtt,
          rightAtt)
      }
    }

    var max = 0;
    var self = this;
    var GKs = [GK];
    var CDs = [CD, OCD, CDTL];
    var LDs = [LD, OLD, DLD, LDTM];
    var MFs = [MF, OMF, DMF, MFTL];
    var Ws = [W, OW, DW, WTM];
    var STs = [ST, DST, STTL];
    var zones = [GKs, CDs, LDs, MFs, Ws, STs];
    var positionsCopy = this.positions.slice();
    this.asignedPositions = [];
    this.midfield = 0;
    this.centralDefense = 0;
    this.centralAttack = 0;
    for (var player of this.players) {
      var position = getPosition(positionsCopy);
      this.asignedPositions.push(position);
      var playersInZone;
      for (var zone of zones)
        if (zone.indexOf(position) !== -1) player.playersInZone = count(zone);
      this.midfield += player.positions[position][player.playersInZone].midfield;
      this.centralAttack += player.positions[position][player.playersInZone].centralAttack;
      this.centralDefense += player.positions[position][player.playersInZone].centralDefense;
    }
    switchTeam(0, 0, 0, 0, 0);
  }

  getValue(expectedMidfield, expectedLeftDefense, expectedCentralDefense, expectedRightDefense, expectedLeftAttack, expectedCentralAttack, expectedRightAttack) {
    return this.midfield / expectedMidfield * (getPercentage(this.centralAttack, expectedCentralDefense) + getPercentage(this.leftAttack, expectedRightDefense) +
      getPercentage(this.rightAttack, expectedLeftDefense)) / (getPercentage(expectedCentralAttack, this.centralDefense) +
      getPercentage(expectedRightAttack, this.leftDefense) + getPercentage(expectedLeftDefense, this.rightDefense));
  }
}

class Position {
  constructor(name, values, form) {
    var {
      centralAttack = 0,
        centralDefense = 0,
        lateralAttack = 0,
        lateralDefense = 0,
        midfield = 0
    } = values;
    this.centralAttack = centralAttack * form;
    this.centralDefense = centralDefense * form;
    this.name = name;
    this.lateralAttack = lateralAttack * form;
    this.lateralDefense = lateralDefense * form;
    this.midfield = midfield * form;
  }
}

class Player {
  constructor(name, stats) {
    var {
      defending,
      goalkeeper,
      passing,
      playmaking,
      scoring,
      wing,
      form,
      isTechnical
    } = stats;
    this.name = name;
    form = ([0, 0.35, 0.44, 0.53, 0.63, 0.72, 0.81, 0.91, 1])[form];
    maxDefending = Math.max(maxDefending, defending * form);
    maxGoalkeeper = Math.max(maxGoalkeeper, goalkeeper * form);
    maxPassing = Math.max(maxPassing, passing * form);
    maxScoring = Math.max(maxScoring, scoring * form);
    maxWing = Math.max(maxWing, wing * form);
    maxPlaymaking = Math.max(maxPlaymaking, playmaking * form);
    this.positions = [
      [
        null,
        new Position("Goalkeeper", {
          centralDefense: 0.8892 * goalkeeper + 0.4226 * defending,
          lateralDefense: 0.6296 * goalkeeper + 0.2821 * defending
        }, form)
      ],
      [
        null,
        new Position("Central defender", {
          centralDefense: defending,
          lateralDefense: 0.5296 * defending,
          midfield: 0.2521 * playmaking
        }, form),
        new Position("Central defender", {
          centralDefense: 0.964 * defending,
          lateralDefense: 0.5105 * defending,
          midfield: 0.243 * playmaking
        }, form),
        new Position("Central defender", {
          centralDefense: 0.914 * defending,
          lateralDefense: 0.484 * defending,
          midfield: 0.2304 * playmaking
        }, form)
      ],
      [
        null,
        new Position("Offensive central defender", {
          centralDefense: 0.6986 * defending,
          lateralDefense: 0.4005 * defending,
          midfield: 0.411 * playmaking
        }, form),
        new Position("Offensive central defender", {
          centralDefense: 0.6734 * defending,
          lateralDefense: 0.386 * defending,
          midfield: 0.3962 * playmaking
        }, form), new Position("Offensive central defender", {
          centralDefense: 0.6385 * defending,
          lateralDefense: 0.366 * defending,
          midfield: 0.3756 * playmaking
        }, form)
      ],
      [
        null,
        new Position("Central defender towards lateral", {
          centralDefense: 0.68 * defending,
          lateralDefense: 0.8248 * defending,
          midfield: 0.1763 * playmaking,
          lateralAttack: 0.2673 * wing
        }, form),
        new Position("Central defender towards lateral", {
          centralDefense: 0.6555 * defending,
          lateralDefense: 0.795 * defending,
          midfield: 0.1699 * playmaking,
          lateralAttack: 0.2576 * wing
        }, form),
        new Position("Central defender towards lateral", {
          centralDefense: 0.6214 * defending,
          lateralDefense: 0.7538 * defending,
          midfield: 0.1611 * playmaking,
          lateralAttack: 0.2443 * wing
        }, form)
      ],
      [
        null,
        new Position("Lateral defender", {
          centralDefense: 0.4109 * defending,
          lateralDefense: 0.9413 * defending,
          midfield: 0.1667 * playmaking,
          lateralAttack: 0.5219 * wing
        }, form),
        new Position("Lateral defender", {
          centralDefense: 0.4109 * defending,
          lateralDefense: 0.9413 * defending,
          midfield: 0.1667 * playmaking,
          lateralAttack: 0.5219 * wing
        }, form)
      ],
      [
        null,
        new Position("Offensive lateral defender", {
          centralDefense: 0.3804 * defending,
          lateralDefense: 0.6714 * defending,
          midfield: 0.2308 * playmaking,
          lateralAttack: 0.6707 * wing
        }, form),
        new Position("Offensive lateral defender", {
          centralDefense: 0.3804 * defending,
          lateralDefense: 0.6714 * defending,
          midfield: 0.2308 * playmaking,
          lateralAttack: 0.6707 * wing
        }, form)
      ],
      [
        null,
        new Position("Defensive lateral defender", {
          centralDefense: 0.4761 * defending,
          lateralDefense: defending,
          midfield: 0.0662 * playmaking,
          lateralAttack: 0.3303 * wing
        }, form),
        new Position("Defensive lateral defender", {
          centralDefense: 0.4761 * defending,
          lateralDefense: defending,
          midfield: 0.0662 * playmaking,
          lateralAttack: 0.3303 * wing
        }, form)
      ],
      [
        null,
        new Position("Lateral defender towards middle", {
          centralDefense: 0.6794 * defending,
          lateralDefense: 0.7204 * defending,
          midfield: 0.1667 * playmaking,
          lateralAttack: 0.2901 * wing
        }, form),
        new Position("Lateral defender towards middle", {
          centralDefense: 0.6794 * defending,
          lateralDefense: 0.7204 * defending,
          midfield: 0.1667 * playmaking,
          lateralAttack: 0.2901 * wing
        }, form)
      ],
      [
        null,
        new Position("Midfielder", {
          centralDefense: 0.378 * defending,
          lateralDefense: 0.1929 * defending,
          midfield: playmaking,
          lateralAttack: 0.2276 * passing,
          centralAttack: 0.3383 * passing + 0.21 * scoring
        }, form),
        new Position("Midfielder", {
          centralDefense: 0.3534 * defending,
          lateralDefense: 0.1833 * defending,
          midfield: 0.9359 * playmaking,
          lateralAttack: 0.2128 * passing,
          centralAttack: 0.3163 * passing + 0.1964 * scoring
        }, form),
        new Position("Midfielder", {
          centralDefense: 0.3126 * defending,
          lateralDefense: 0.1562 * defending,
          midfield: 0.8271 * playmaking,
          lateralAttack: 0.1882 * passing,
          centralAttack: 0.2664 * passing + 0.1733 * scoring
        }, form)
      ],
      [
        null,
        new Position("Offensive midfielder", {
          centralDefense: 0.1609 * defending,
          lateralDefense: 0.0803 * defending,
          midfield: 0.9444 * playmaking,
          lateralAttack: 0.242 * passing,
          centralAttack: 0.5031 * passing + 0.31 * scoring
        }, form),
        new Position("Offensive midfielder", {
          centralDefense: 0.1504 * defending,
          lateralDefense: 0.0751 * defending,
          midfield: 0.883 * playmaking,
          lateralAttack: 0.2262 * passing,
          centralAttack: 0.4703 * passing + 0.2899 * scoring
        }, form),
        new Position("Offensive midfielder", {
          centralDefense: 0.133 * defending,
          lateralDefense: 0.0633 * defending,
          midfield: 0.781 * playmaking,
          lateralAttack: 0.2001 * passing,
          centralAttack: 0.3962 * passing + 0.2558 * scoring
        }, form)
      ],
      [
        null,
        new Position("Defensive midfielder", {
          centralDefense: 0.6204 * defending,
          lateralDefense: 0.2765 * defending,
          midfield: 0.9444 * playmaking,
          lateralAttack: 0.1172 * passing,
          centralAttack: 0.1736 * passing + 0.12 * scoring
        }, form),
        new Position("Defensive midfielder", {
          centralDefense: 0.28 * defending,
          lateralDefense: 0.2585 * defending,
          midfield: 0.883 * playmaking,
          lateralAttack: 0.1095 * passing,
          centralAttack: 0.1622 * passing + 0.1122 * scoring
        }, form),
        new Position("Defensive midfielder", {
          centralDefense: 0.513 * defending,
          lateralDefense: 0.2233 * defending,
          midfield: 0.781 * playmaking,
          lateralAttack: 0.1211 * passing,
          centralAttack: 0.1794 * passing + 0.099 * scoring
        }, form)
      ],
      [
        null,
        new Position("Midfielder towards lateral", {
          centralDefense: 0.3461 * defending,
          lateralDefense: 0.2546 * defending,
          midfield: 0.8825 * playmaking,
          lateralAttack: 0.5153 * wing + 0.2835 * passing,
          centralAttack: 0.2433 * passing
        }, form),
        new Position("Midfielder towards lateral", {
          centralDefense: 0.3236 * defending,
          lateralDefense: 0.238 * defending,
          midfield: 0.8251 * playmaking,
          lateralAttack: 0.4818 * wing + 0.265 * passing,
          centralAttack: 0.2274 * passing
        }, form),
        new Position("Midfielder towards lateral", {
          centralDefense: 0.3208 * defending,
          lateralDefense: 0.2405 * defending,
          midfield: 0.7298 * playmaking,
          lateralAttack: 0.4261 * wing + 0.2344 * passing,
          centralAttack: 0.2012 * passing
        }, form)
      ],
      [
        null,
        new Position("Wing", {
          centralDefense: 0.2002 * defending,
          lateralDefense: 0.3571 * defending,
          midfield: 0.4658 * playmaking,
          lateralAttack: 0.7723 * wing + 0.2186 * passing,
          centralAttack: 0.1181 * passing
        }, form),
        new Position("Wing", {
          centralDefense: 0.2002 * defending,
          lateralDefense: 0.3571 * defending,
          midfield: 0.4658 * playmaking,
          lateralAttack: 0.7723 * wing + 0.2186 * passing,
          centralAttack: 0.1181 * passing
        }, form)
      ],
      [
        null,
        new Position("Offensive wing", {
          centralDefense: 0.0689 * defending,
          lateralDefense: 0.1888 * defending,
          midfield: 0.3128 * playmaking,
          lateralAttack: 0.86 * wing + 0.2511 * passing,
          centralAttack: 0.1336 * passing
        }, form),
        new Position("Offensive wing", {
          centralDefense: 0.0689 * defending,
          lateralDefense: 0.1888 * defending,
          midfield: 0.3128 * playmaking,
          lateralAttack: 0.86 * wing + 0.2511 * passing,
          centralAttack: 0.1336 * passing
        }, form)
      ],
      [
        null,
        new Position("Defensive wing", {
          centralDefense: 0.2671 * defending,
          lateralDefense: 0.5082 * defending,
          midfield: 0.391 * playmaking,
          lateralAttack: 0.5982 * wing + 0.1802 * passing,
          centralAttack: 0.0518 * passing
        }, form),
        new Position("Defensive wing", {
          centralDefense: 0.2671 * defending,
          lateralDefense: 0.5082 * defending,
          midfield: 0.391 * playmaking,
          lateralAttack: 0.5982 * wing + 0.1802 * passing,
          centralAttack: 0.0518 * passing
        }, form)
      ],
      [
        null,
        new Position("Wing towards middle", {
          centralDefense: 0.2552 * defending,
          lateralDefense: 0.3189 * defending,
          midfield: 0.6487 * playmaking,
          lateralAttack: 0.694 * wing + 0.2178 * passing,
          centralAttack: 0.1469 * passing
        }, form),
        new Position("Wing towards middle", {
          centralDefense: 0.2552 * defending,
          lateralDefense: 0.3189 * defending,
          midfield: 0.6487 * playmaking,
          lateralAttack: 0.694 * wing + 0.2178 * passing,
          centralAttack: 0.1469 * passing
        }, form)
      ],
      [
        null,
        new Position("Striker", {
          midfield: 0.25 * playmaking,
          lateralAttack: 0.194 * wing + 0.1279 * passing + 0.2354 * scoring,
          centralAttack: 0.3689 * passing + scoring
        }, form),
        new Position("Striker", {
          midfield: 0.2363 * playmaking,
          lateralAttack: 0.1833 * wing + 0.1208 * passing + 0.2224 * scoring,
          centralAttack: 0.3186 * passing + 0.9459 * scoring
        }, form),
        new Position("Striker", {
          midfield: 0.2163 * playmaking,
          lateralAttack: 0.1676 * wing + 0.1105 * passing + 0.2033 * scoring,
          centralAttack: 0.3187 * passing + 0.864 * scoring
        }, form)
      ],
      [
        null,
        new Position("Defensive striker", {
          midfield: 0.4167 * playmaking,
          lateralAttack: 0.1321 * wing + (isTechnical ? 0.3514 : 0.2378) * passing + 0.1201 * scoring,
          centralAttack: 0.5718 * passing + 0.5852 * scoring
        }, form),
        new Position("Defensive striker", {
          midfield: 0.3937 * playmaking,
          lateralAttack: 0.1249 * wing + (isTechnical ? 0.332 : 0.2247) * passing + 0.1134 * scoring,
          centralAttack: 0.5403 * passing + 0.553 * scoring
        }, form),
        new Position("Defensive striker", {
          midfield: 0.36 * playmaking,
          lateralAttack: 0.1141 * wing + (isTechnical ? 0.3036 : 0.2054) * passing + 0.1037 * scoring,
          centralAttack: 0.494 * passing + 0.5062 * scoring
        }, form)
      ],
      [
        null,
        new Position("Striker towards lateral", {
          midfield: 0.15 * playmaking,
          lateralAttack: 0.433 * wing + 0.1892 * passing + 0.3994 * scoring,
          centralAttack: 0.2604 * passing + 0.6093 * scoring
        }, form),
        new Position("Striker towards lateral", {
          midfield: 0.1418 * playmaking,
          lateralAttack: 0.4091 * wing + 0.1787 * passing + 0.3774 * scoring,
          centralAttack: 0.246 * passing + 0.5757 * scoring
        }, form),
        new Position("Striker towards lateral", {
          midfield: 0.1298 * playmaking,
          lateralAttack: 0.3741 * wing + 0.1634 * passing + 0.345 * scoring,
          centralAttack: 0.2249 * passing + 0.5264 * scoring
        }, form)
      ]
    ]
  }
}

function getPercentage(a, b) {
  return a / (a + b);
}

function getPosition(positionsCopy) {
  for (var i = 0; i < positionsCopy.length; i++) {
    if (positionsCopy[i]) {
      positionsCopy[i]--;
      return i;
    }
  }
}

function hasNoDuplicates(arr) {
  return arr.every(val => arr.indexOf(val) === arr.lastIndexOf(val));
}

function arraySwitch(array, i, j) {
  var temp = array[i];
  array[i] = array[j];
  array[j] = temp;
}

var formations = [];
for (var CDTLs = 0; CDTLs < 3; CDTLs++)
  for (var CDs = 0; CDs < 4 - CDTLs; CDs++)
    for (var OCDs = 0; OCDs < 4 - CDs - CDTLs; OCDs++)
      for (var LDs = 0; LDs < 3; LDs++)
        for (var OLDs = 0; OLDs < 3 - LDs; OLDs++)
          for (var DLDs = 0; DLDs < 3 - LDs - OLDs; DLDs++)
            for (var LDTMs = 0; LDTMs < 3 - LDs - OLDs - DLDs; LDTMs++)
              for (var MFTLs = 0; MFTLs < 3; MFTLs++)
                for (var MFs = 0; MFs < 4 - MFTLs; MFs++)
                  for (var OMFs = 0; OMFs < 4 - MFTLs - MFs; OMFs++)
                    for (var DMFs = 0; DMFs < 4 - MFTLs - MFs - OMFs; DMFs++)
                      for (var Ws = 0; Ws < 3; Ws++)
                        for (var OWs = 0; OWs < 3 - Ws; OWs++)
                          for (var DWs = 0; DWs < 3 - Ws - OWs; DWs++)
                            for (var WTMs = 0; WTMs < 3 - Ws - OWs - DWs; WTMs++)
                              for (var STTLs = 0; STTLs < 3; STTLs++)
                                for (var STs = 0; STs < 4 - STTLs; STs++)
                                  for (var DSTs = 0; DSTs < 4 - STTLs - STs; DSTs++) {
                                    var formation = new Formation([1, CDs, OCDs, CDTLs, LDs, OLDs, DLDs, LDTMs, MFs, OMFs, DMFs, MFTLs, Ws, OWs, DWs, WTMs, STs, DSTs, STTLs]);
                                    if (formation.isValid()) formations.push(formation);
                                  }
var maxGoalkeeper;
var maxDefending;
var maxPlaymaking;
var maxWing;
var maxPassing;
var maxScoring;

function logBestFormation() {
  maxGoalkeeper = 0;
  maxDefending = 0;
  maxPlaymaking = 0;
  maxWing = 0;
  maxPassing = 0;
  maxScoring = 0;
  var players = [
    new Player("1. Luis Andrés Kessler", {
      goalkeeper: 6,
      defending: 5,
      playmaking: 1,
      wing: 1,
      passing: 1,
      scoring: 1,
      form: 4,
      isTechnical: false
    }),
    new Player("2. Luciano Gabriel Caire", {
      goalkeeper: 1,
      defending: 7,
      playmaking: 3,
      wing: 3,
      passing: 3,
      scoring: 3,
      form: 6,
      isTechnical: true
    }),
    new Player("3. Diego Vettere", {
      goalkeeper: 1,
      defending: 5,
      playmaking: 5,
      wing: 5,
      passing: 5,
      scoring: 5,
      form: 6,
      isTechnical: false
    }),
    new Player("4. Pablo Federico Ragg", {
      goalkeeper: 1,
      defending: 7,
      playmaking: 3,
      wing: 3,
      passing: 3,
      scoring: 3,
      form: 6,
      isTechnical: false
    }),
    new Player("5. Enzo Riedel", {
      goalkeeper: 1,
      defending: 6,
      playmaking: 7,
      wing: 7,
      passing: 7,
      scoring: 7,
      form: 6,
      isTechnical: false
    }),
    new Player("6. Héctor Montenegro", {
      goalkeeper: 1,
      defending: 7,
      playmaking: 5,
      wing: 5,
      passing: 5,
      scoring: 5,
      form: 8,
      isTechnical: false
    }),
    new Player("7. Líber Marzolini", {
      goalkeeper: 1,
      defending: 4,
      playmaking: 5,
      wing: 5,
      passing: 5,
      scoring: 5,
      form: 5,
      isTechnical: false
    }),
    new Player("8. Benjamin Bollerhey", {
      goalkeeper: 1,
      defending: 5,
      playmaking: 6,
      wing: 6,
      passing: 6,
      scoring: 6,
      form: 4,
      isTechnical: false
    }),
    new Player("9. Antonio Arano", {
      goalkeeper: 1,
      defending: 2,
      playmaking: 4,
      wing: 4,
      passing: 4,
      scoring: 4,
      form: 6,
      isTechnical: false
    }),
    new Player("10. Sebastián Andrés Montaldo", {
      goalkeeper: 1,
      defending: 3,
      playmaking: 7,
      wing: 7,
      passing: 7,
      scoring: 7,
      form: 6,
      isTechnical: false
    }),
    new Player("11. Matteo Vinante", {
      goalkeeper: 1,
      defending: 3,
      playmaking: 3,
      wing: 3,
      passing: 3,
      scoring: 3,
      form: 5,
      isTechnical: false
    }),
    new Player("12. Enrique Sanz", {
      goalkeeper: 6,
      defending: 3,
      playmaking: 1,
      wing: 1,
      passing: 1,
      scoring: 1,
      form: 5,
      isTechnical: true
    }),
    new Player("13. Santiago Hernán Hidalgo", {
      goalkeeper: 1,
      defending: 6,
      playmaking: 5,
      wing: 5,
      passing: 5,
      scoring: 5,
      form: 7,
      isTechnical: false
    }),
    new Player("14. Alfons Rudolph", {
      goalkeeper: 2,
      defending: 5,
      playmaking: 6,
      wing: 6,
      passing: 6,
      scoring: 6,
      form: 5,
      isTechnical: false
    }),
    new Player("15. Oscar Alfredo Turus", {
      goalkeeper: 1,
      defending: 6,
      playmaking: 5,
      wing: 5,
      passing: 5,
      scoring: 5,
      form: 4,
      isTechnical: false
    }),
    new Player("16. Guido Lissa", {
      goalkeeper: 1,
      defending: 5,
      playmaking: 6,
      wing: 6,
      passing: 6,
      scoring: 6,
      form: 5,
      isTechnical: false
    }),
    new Player("17. Sebastián Sorohuet", {
      goalkeeper: 2,
      defending: 6,
      playmaking: 6,
      wing: 6,
      passing: 6,
      scoring: 6,
      form: 4,
      isTechnical: false
    }),
    new Player("19. Federico Ortigoza", {
      goalkeeper: 1,
      defending: 5,
      playmaking: 6,
      wing: 6,
      passing: 6,
      scoring: 6,
      form: 7,
      isTechnical: false
    }),
    new Player("53. Pedro Máximo Gandín", {
      goalkeeper: 1,
      defending: 3,
      playmaking: 4,
      wing: 4,
      passing: 4,
      scoring: 4,
      form: 5,
      isTechnical: false
    }),
    new Player("Adrien Wetterwald", {
      goalkeeper: 1,
      defending: 5,
      playmaking: 8,
      wing: 8,
      passing: 8,
      scoring: 8,
      form: 3,
      isTechnical: false
    }),
    new Player("Antonio Larrondo", {
      goalkeeper: 1,
      defending: 2,
      playmaking: 1,
      wing: 1,
      passing: 1,
      scoring: 1,
      form: 2,
      isTechnical: false
    }),
    new Player("Egon Jehle", {
      goalkeeper: 1,
      defending: 2,
      playmaking: 2,
      wing: 2,
      passing: 2,
      scoring: 2,
      form: 2,
      isTechnical: false
    })
  ];
  var bestPossiblePlayer = new Player("Jari Litmanen", {
    goalkeeper: maxGoalkeeper,
    defending: maxDefending,
    playmaking: maxPlaymaking,
    wing: maxWing,
    passing: maxPassing,
    scoring: maxScoring,
    form: 8,
    isTechnical: true
  });
  var bestPlayersByPosition = [];
  for (var position = GK; position <= STTL; position++) {
    bestPlayersByPosition[position] = [];
    players.sort((a, b) => b.positions[position][1].centralDefense - a.positions[position][1].centralDefense);
    for (var i = 0; i < 11; i++)
      if (bestPlayersByPosition[position].indexOf(players[i]) === -1) bestPlayersByPosition[position].push(players[i]);
    players.sort((a, b) => b.positions[position][1].lateralDefense - a.positions[position][1].lateralDefense);
    for (var i = 0; i < 11; i++)
      if (bestPlayersByPosition[position].indexOf(players[i]) === -1) bestPlayersByPosition[position].push(players[i]);
    players.sort((a, b) => b.positions[position][1].midfield - a.positions[position][1].midfield);
    for (var i = 0; i < 11; i++)
      if (bestPlayersByPosition[position].indexOf(players[i]) === -1) bestPlayersByPosition[position].push(players[i]);
    players.sort((a, b) => b.positions[position][1].lateralAttack - a.positions[position][1].lateralAttack);
    for (var i = 0; i < 11; i++)
      if (bestPlayersByPosition[position].indexOf(players[i]) === -1) bestPlayersByPosition[position].push(players[i]);
    players.sort((a, b) => b.positions[position][1].centralDefense - a.positions[position][1].centralAttack);
    for (var i = 0; i < 11; i++)
      if (bestPlayersByPosition[position].indexOf(players[i]) === -1) bestPlayersByPosition[position].push(players[i]);
  }
  bestPlayersByPosition[GK].sort((a, b) => b.positions[GK][1].centralDefense - a.positions[GK][1].centralDefense);
  bestPlayersByPosition[CD].sort((a, b) => b.positions[CD][1].centralDefense - a.positions[CD][1].centralDefense);
  bestPlayersByPosition[OCD].sort((a, b) => b.positions[OCD][1].centralDefense - a.positions[OCD][1].centralDefense);
  bestPlayersByPosition[CDTL].sort((a, b) => b.positions[CDTL][1].lateralDefense - a.positions[CDTL][1].lateralDefense);
  bestPlayersByPosition[LD].sort((a, b) => b.positions[LD][1].lateralDefense - a.positions[LD][1].lateralDefense);
  bestPlayersByPosition[OLD].sort((a, b) => b.positions[OLD][1].lateralDefense - a.positions[OLD][1].lateralDefense);
  bestPlayersByPosition[DLD].sort((a, b) => b.positions[DLD][1].lateralDefense - a.positions[DLD][1].lateralDefense);
  bestPlayersByPosition[LDTM].sort((a, b) => b.positions[LDTM][1].lateralDefense - a.positions[LDTM][1].lateralDefense);
  bestPlayersByPosition[MF].sort((a, b) => b.positions[MF][1].midfield - a.positions[MF][1].midfield);
  bestPlayersByPosition[OMF].sort((a, b) => b.positions[MF][1].midfield - a.positions[MF][1].midfield);
  bestPlayersByPosition[DMF].sort((a, b) => b.positions[MF][1].midfield - a.positions[MF][1].midfield);
  bestPlayersByPosition[MFTL].sort((a, b) => b.positions[MF][1].midfield - a.positions[MF][1].midfield);
  bestPlayersByPosition[W].sort((a, b) => b.positions[W][1].lateralAttack - a.positions[W][1].lateralAttack);
  bestPlayersByPosition[OW].sort((a, b) => b.positions[OW][1].lateralAttack - a.positions[OW][1].lateralAttack);
  bestPlayersByPosition[DW].sort((a, b) => b.positions[DW][1].lateralAttack - a.positions[DW][1].lateralAttack);
  bestPlayersByPosition[WTM].sort((a, b) => b.positions[WTM][1].lateralAttack - a.positions[WTM][1].lateralAttack);
  bestPlayersByPosition[ST].sort((a, b) => b.positions[ST][1].centralAttack - a.positions[ST][1].centralAttack);
  bestPlayersByPosition[DST].sort((a, b) => b.positions[DST][1].centralAttack - a.positions[DST][1].centralAttack);
  bestPlayersByPosition[STTL].sort((a, b) => b.positions[STTL][1].centralAttack - a.positions[STTL][1].centralAttack);
  var bestFormation = new Formation(formations[0].positions);
  var positionsCopy = bestFormation.positions.slice();
  var squad = [];
  for (var i = 0; i < 11; i++) {
    var position = getPosition(positionsCopy);
    var j = 0;
    var player = bestPlayersByPosition[position][j];
    while (squad.indexOf(player) !== -1) {
      j++;
      player = bestPlayersByPosition[position][j];
    }
    squad[i] = player;
  }
  bestFormation.players = squad;
  bestFormation.alignPlayers(7.75, 7.5, 8, 6.5, 7.5, 12.75, 7.5);
  var bestFormationValue = bestFormation.getValue(7.75, 7.5, 8, 6.5, 7.5, 12.75, 7.5);
  var players = [...(new Set([
    ...bestPlayersByPosition[GK],
    ...bestPlayersByPosition[CD],
    ...bestPlayersByPosition[OCD],
    ...bestPlayersByPosition[CDTL],
    ...bestPlayersByPosition[LD],
    ...bestPlayersByPosition[OLD],
    ...bestPlayersByPosition[DLD],
    ...bestPlayersByPosition[LDTM],
    ...bestPlayersByPosition[MF],
    ...bestPlayersByPosition[OMF],
    ...bestPlayersByPosition[DMF],
    ...bestPlayersByPosition[MFTL],
    ...bestPlayersByPosition[W],
    ...bestPlayersByPosition[OW],
    ...bestPlayersByPosition[DW],
    ...bestPlayersByPosition[WTM],
    ...bestPlayersByPosition[ST],
    ...bestPlayersByPosition[DST],
    ...bestPlayersByPosition[STTL]
  ]))];
  /* Start with a team full of bestPossiblePlayers
   ** Replace players in a way that maximizes a specific team score
   ** If none of the scores are greater than the bestFormation respective scores, the selected players combination is useless
   ** Else test them in all possible formations
   ** Formation to maximize...
   ** |_central defense: 1 GK - 3 CD - 2 LDTM - 3 DMF - 2 DW or 3 CD - 1 GK - 2 LDTM - 3 DMF - 2 DW or 3 CD - 2 LDTM - 1 GK - 3 DMF - 2 DW or 3 CD - 2 LDTM - 3 DMF - 1 GK - 2 DW or 3 CD - 2 LDTM - 3 DMF - 2 DW - 1 GK
   ** |
   ** |_lateral defense: 1 GK - 1 DLD - 1 CDTL - 1 CD - 1 DW - 2 DMF - 4 other or 1 DLD - 1 GK - 1 CDTL - 1 CD - 1 DW - 2 DMF - 4 other or 1 DLD - 1 CDTL - 1 GK - 1 CD - 1 DW - 2 DMF - 4 other or 1 DLD - 1 CDTL - 1 CD - 1 GK - 1 DW - 2 DMF - 4 other or 1 DLD - 1 CDTL - 1 CD - 1 DW - 1 GK - 2 DMF - 4 other or 1 DLD - 1 CDTL - 1 CD - 1 DW - 2 DMF - 1 GK - 4 other
   ** |
   ** |_midfield: 3 MF - 2 WMT - 3 DST - 2 OCD - 1 other
   ** |
   ** |_central attack: TODO
   ** |
   ** |_lateral attack: TODO
   */
  var selectedPlayers;
  var positions;
  var positionsCopy;
  var squad;
  for (var player1 of players) {
    for (var player2 of bestPlayersByPosition[positions[1]]) {
      if (new Set([player1, player2]).size != 2) continue;
      for (var player3 of bestPlayersByPosition[positions[2]]) {
        if (new Set([player1, player2, player3]).size != 3) continue;
        for (var player4 of bestPlayersByPosition[positions[3]]) {
          if (new Set([player1, player2, player3, player4]).size != 4) continue;
          for (var player5 of bestPlayersByPosition[positions[4]]) {
            if (new Set([player1, player2, player3, player4, player5]).size != 5) continue;
            positions = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            positions[CD] = 3;
            positions[LDTM] = 2;
            positions[DMF] = 3;
            positions[DW] = 2;
            positionsCopy = positions.slice();
          }
        }
      }
    }
  }
}