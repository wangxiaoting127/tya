import { expect } from 'chai'
import { Json2Xml } from "../src/parser/json2xml"

describe('json to xml,', function(){
  
  it('with key and array', function(){
    expect(Json2Xml.parse({articles: [0, 1, 2, 3, 4]})).to.be.equal("<articles>0</articles><articles>1</articles><articles>2</articles><articles>3</articles><articles>4</articles>")
  })

  it('with a json', function(){
    expect(Json2Xml.parse({
      articles : {
          title: 'json 2 xml'
        , content: 'parse a json'
      }
    })).to.be.equal('<articles title="json 2 xml" content="parse a json"></articles>')
  })

  it('with array', function(){
    expect(Json2Xml.parse([0, 1, 2, 3, 4])).to.be.equal("<0></0><1>1</1><2>2</2><3>3</3><4>4</4>")
  })

  it('with nest array', function(){
    expect(Json2Xml.parse({articles: 
      [ [1, 2, 3]
      , [4, 5, 6]
      , [7, 8, 9]
      ]
    })).to.be.equal('<articles 0="1" 1="2" 2="3"></articles><articles 0="4" 1="5" 2="6"></articles><articles 0="7" 1="8" 2="9"></articles>')
  })

})