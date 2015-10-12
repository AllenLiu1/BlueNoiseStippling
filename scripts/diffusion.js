var _diffusion = undefined;

define([
  'util', 'const'
], function(util, cconst) {
  'use strict';
  
  var exports = _diffusion = {};
  var Class = util.Class;
  
  var Filter = exports.Filter = Class([
    function constructor(data) {
      this.wrand = data[2];
      this.rand = data[3];
      
      //matrix of weight, random-factor, tuples
      this.filter = [];
      this.inten = 0.0;
      
      var fil = data[1];
      
      for (var i=0; i<fil.length; i++) {
        var row = [];
        this.filter.push(row);
        
        for (var j=0; j<fil[i].length; j++) {
          row.push([fil[i][j], 0.0]);
        }
      }
      
      this.get_cache = new Array(32);
      
      for (var i=0; i<this.get_cache.length; i++) {
        var fil = new Array(this.filter.length);
        
        for (var j=0; j<fil.length; j++) {
          fil[j] = new Array(this.filter[j].length);
        }
        
        this.get_cache[i] = fil; 
      }
      
      this.get_cache.cur = 0;
    },
    
    function copy() {
      var fl = this.get(0);
      
      var f = new Filter([this.inten, fl, this.wrand, this.rand]);
      f.inten = this.inten;
      f.rand = this.rand;
      f.wrand = this.wrand;
      
      return f;
    },
    
    function get(f) {
      var ret = this.get_cache[this.get_cache.cur];
      this.get_cache.cur = (this.get_cache.cur+1) % this.get_cache.length;
      var tot=0.0;
      
      for (var i=0; i<ret.length; i++) {
        for (var j=0; j<ret[i].length; j++) {
          var a = this.filter[i][j][0];
          var r = this.filter[i][j][1];
          
          if (r != 0.0) {
            a += Math.random()*r;
          }
          
          ret[i][j] = a;
          tot += a;
        }
      }
      
      tot = tot != 0.0 ? 1.0 / tot : 0.0;
      
      for (var i=0; i<ret.length; i++) {
        for (var j=0; j<ret[i].length; j++) {
          ret[i][j] *= tot;
        }
      }
      
      return ret;
    }
  ]);

  var basic_filter = exports.basic_filter = function basic_filter() {
    var fil = [];

    var wmax = 0.0;
    for (var i=0; i<4; i++) {
      var row = [];
      fil.push(row);
      
      for (var j=0; j<6; j++) {
        var w = i*i + j*j;
        wmax = Math.max(w, wmax);
        
        row.push(w);
      }
    }
    
    wmax = wmax != 0.0 ? 1.0/wmax : 0.0;
    
    fil[0][0] = fil[0][1] = fil[0][2] = 0.0;
    
    var tot = 0.0;
    for (var i=0; i<4; i++) {
      for (var j=0; j<6; j++) {
        if (i == 0 && j < 3) {
          continue;
        }
        
        fil[i][j] = 1.0 - fil[i][j]*wmax;
        
        tot += fil[i][j];
      }
    }
    
    tot = tot != 0.0 ? 1.0 / tot : tot;
    for (var i=0; i<4; i++) {
      for (var j=0; j<6; j++) {
        fil[i][j] *= tot;
      }
    }
    //floyd steinberg
    var fil = [
      [0, 0, 0, 7, 0],
      [0, 3, 5, 1, 0],
      [0, 0, 0, 0, 0],
      //[0, 0, 0, 0, 0, 0]
    ];
    
    var ret = new Filter([0.0, fil, 0.0, 0.0]);
    
    ret.rand = 1.0;
    ret.wrand = 0.3;
    
    return ret;
  }

  return exports;
});
