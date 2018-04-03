
const FLOWERS = {
  name: 'flowers',
  url: 'https://farm5.staticflickr.com/4607/38967463314_c6a259499d_o_d.png'
}

const GIRL = {
  name: 'girl',
  url: 'https://farm5.staticflickr.com/4612/24866654927_179de5c7ab_o_d.png'
}

const HOUSE = {
  name: 'house',
  url: 'https://farm5.staticflickr.com/4671/24820866057_7d192260d6_o_d.png'
}

const MOUNTAIN = {
  name: 'mountain',
  url: 'https://farm5.staticflickr.com/4746/38837745385_e93724816e_o_d.png'
}

const RAINBOW = {
  name: 'rainbow',
  url: 'https://farm5.staticflickr.com/4758/27910887609_a77d0ce16f_o_d.png'
}

const TRUCK = {
  name: 'truck',
  url: 'https://farm5.staticflickr.com/4612/39736007481_c7ab6c2feb_o_d.png'
}

const VOLCANO = {
  name: 'volcano',
  url: 'https://farm5.staticflickr.com/4743/25817320628_86d82b6653_o_d.png'
}

const WHALE = {
  name: 'whale',
  url: 'https://farm5.staticflickr.com/4748/39704709752_160a6ab924_o_d.png'
}

const pictureMap = {
  fish: WHALE,
  flowers: FLOWERS,
  flower: FLOWERS,
  girl: GIRL,
  girls: GIRL,
  house: HOUSE,
  houses: HOUSE,
  mountain: MOUNTAIN,
  mountains: MOUNTAIN,
  rainbow: RAINBOW,
  rainbows: RAINBOW,
  truck: TRUCK,
  trucks: TRUCK,
  volcano: VOLCANO,
  volcanoes: VOLCANO,
  whale: WHALE,
  whales: WHALE
}

const images = [FLOWERS, GIRL, HOUSE, MOUNTAIN, RAINBOW, TRUCK, VOLCANO, WHALE]

exports.map = pictureMap
exports.list = images