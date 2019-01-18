(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{11:function(e,t){var n=t.Quote={};n.read=function(e,t){return e.readFields(n._readField,{rec:null,instrumentId:"",bid:"",ask:"",time:0},t)},n._readField=function(e,t,n){1===e?t.rec=a.read(n,n.readVarint()+n.pos):2===e?t.instrumentId=n.readString():3===e?t.bid=n.readString():4===e?t.ask=n.readString():5===e&&(t.time=n.readVarint(!0))},n.write=function(e,t){e.rec&&t.writeMessage(1,a.write,e.rec),e.instrumentId&&t.writeStringField(2,e.instrumentId),e.bid&&t.writeStringField(3,e.bid),e.ask&&t.writeStringField(4,e.ask),e.time&&t.writeVarintField(5,e.time)};var a=t.Recipient={};a.read=function(e,t){return e.readFields(a._readField,{brokerId:0,accountId:0},t)},a._readField=function(e,t,n){1===e?t.brokerId=n.readVarint(!0):2===e&&(t.accountId=n.readVarint(!0))},a.write=function(e,t){e.brokerId&&t.writeVarintField(1,e.brokerId),e.accountId&&t.writeVarintField(2,e.accountId)}},14:function(e,t,n){e.exports=n(26)},20:function(e,t,n){},26:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),i=n(5),c=n.n(i),s=(n(20),n(3)),o=n.n(s),u=n(2),l=n(6),d=n(1),m=n(7),b=n(8),g=n(12),k=n(9),f=n(13),h=n(10),p=n.n(h),v=n(11),E={instrumentId:0,bid:0,ask:0,time:0};var I=function(e){function t(){var e,n;Object(m.a)(this,t);for(var a=arguments.length,r=new Array(a),i=0;i<a;i++)r[i]=arguments[i];return(n=Object(g.a)(this,(e=Object(k.a)(t)).call.apply(e,[this].concat(r)))).state={storageUrl:localStorage.getItem("storageUrl")||"",userId:localStorage.getItem("userId")||"",broker:localStorage.getItem("broker")||"",account:localStorage.getItem("account")||"",authorized:!1,loading:!1,socket:null,instruments:[],markets:{}},n.handleInputChange=function(e,t){var a=e.target.value;localStorage.setItem(t,a),n.setState(Object(d.a)({},t,a))},n.handleConnectButtonClick=function(){var e=n.state,t=e.authorized,a=e.storageUrl,r=e.userId,i=n.state.socket;if(t)i&&t&&(n.setState({instruments:[],socket:null}),i.close());else{try{(i=new WebSocket(a.split("?")[0]+"?user="+r)).binaryType="arraybuffer"}catch(c){throw new Error(c)}n.setState({socket:i,loading:!0})}},n.initWebSocket=function(){var e=n.state,t=e.socket,a=e.userId;t.onopen=function(){n.request(JSON.stringify({user:{userId:a}}))},t.onmessage=function(){var e=Object(l.a)(o.a.mark(function e(a){var r,i,c,s,l,d,m,b,g,k,f,h,E,I;return o.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(i=n.state,c=i.authorized,s=i.instruments,l=i.currentMarket,d=i.markets,"1"!==a.data){e.next=3;break}return e.abrupt("return",console.timeEnd("Ping-Pong"));case 3:"string"!==typeof a.data?(m=new p.a(a.data),r=v.Quote.read(m),g=(b=r).instrumentId,k=b.bid,f=b.ask,h=b.time,(E=d[g])||(E={},d[g]=E),E.instrumentId=g,E.bid=k,E.ask=f,E.time=h):r=JSON.parse(a.data),I=r.type,e.t0=I,e.next=0===e.t0?8:1===e.t0?10:7===e.t0?12:10===e.t0?14:16;break;case 8:return c=!0,e.abrupt("break",17);case 10:return c=!1,e.abrupt("break",17);case 12:return s=r.instruments,e.abrupt("break",17);case 14:return r.s.sub[0].sym.forEach(function(e){d[e]={instrumentId:e}}),e.abrupt("break",17);case 16:return e.abrupt("break",17);case 17:n.setState(function(e){return Object(u.a)({},e,{authorized:c,loading:!1,socket:t,instruments:s,currentMarket:l,markets:d})});case 18:case"end":return e.stop()}},e,this)}));return function(t){return e.apply(this,arguments)}}(),t.onerror=function(e){console.log("asdasd")}},n.request=function(e){n.state.socket.send(e)},n.handleInstrumentClick=function(e){var t,a=e.sym,r=n.state,i=r.broker,c=r.account,s=r.markets,o=Object(u.a)({},s),l=[];o[a]?delete o[a]:o[a]=Object(u.a)({},E),Object.keys(o).forEach(function(e){return l.push(e)}),n.setState({markets:o}),t=function(e){var t=5381,n=e.length;for(;n;)t=33*t^e.charCodeAt(--n);return t>>>0}(i+"&"+c+"&"+l),n.request(JSON.stringify({type:1,s:{sub:[{rec:{b:i,a:c},sym:l}],hash:t}}))},n.getInstruments=function(){var e=n.state,t=e.broker,a=e.account;e.socket.send(JSON.stringify({type:2,rec:{b:t,a:a}}))},n.pingPong=function(){var e=n.state.socket;console.time("Ping-Pong"),e.send("0")},n}return Object(f.a)(t,e),Object(b.a)(t,[{key:"componentDidUpdate",value:function(e,t){!t.socket&&this.state.socket&&this.initWebSocket()}},{key:"render",value:function(){var e=this,t=this.state,n=t.authorized,a=t.loading,i=t.instruments,c=t.markets,s=a?r.a.createElement("span",null,"Loading"):r.a.createElement("button",{type:"button",onClick:this.handleConnectButtonClick},n?"Disconnect":"Connect");return r.a.createElement("div",null,r.a.createElement("div",{className:"control"},r.a.createElement("div",null,r.a.createElement("div",{className:"form-group"},r.a.createElement("label",null,"\u0415\u043d\u0434\u043f\u043e\u0438\u043d\u0442 (ws[s]://...)"),r.a.createElement("input",{value:this.state.storageUrl,onChange:function(t){return e.handleInputChange(t,"storageUrl")}})),r.a.createElement("div",{className:"form-group"},r.a.createElement("label",null,"\u042e\u0437\u0435\u0440"),r.a.createElement("input",{value:this.state.userId,onChange:function(t){return e.handleInputChange(t,"userId")}}))),n&&r.a.createElement("div",null,r.a.createElement("div",{className:"form-group"},r.a.createElement("label",null,"\u0411\u0440\u043e\u043a\u0435\u0440"),r.a.createElement("input",{value:this.state.broker,onChange:function(t){return e.handleInputChange(t,"broker")}})),r.a.createElement("div",{className:"form-group"},r.a.createElement("label",null,"\u0410\u043a\u043a\u0430\u0443\u043d\u0442"),r.a.createElement("input",{value:this.state.account,onChange:function(t){return e.handleInputChange(t,"account")}}))),s),n&&r.a.createElement("div",null,r.a.createElement("button",{onClick:this.getInstruments},"Get Instruments"),r.a.createElement("button",{onClick:this.pingPong},"Ping-Pong")),i.map(function(t,n){return r.a.createElement("button",{className:c[t.sym]&&"active",key:n,onClick:function(){return e.handleInstrumentClick({sym:t.sym})}},t.sym)}),r.a.createElement("hr",null),r.a.createElement("div",{className:"body_wrap"},r.a.createElement("div",{className:"trading_wrap"},Object.keys(c).map(function(e){return r.a.createElement("div",{key:e,className:"trading"},r.a.createElement("ul",null,r.a.createElement("li",null,r.a.createElement("b",null,"instrument:")," ",c[e].instrumentId),r.a.createElement("li",null,r.a.createElement("b",null,"bid:")," ",c[e].bid,", ",r.a.createElement("b",null,"ask:")," ",c[e].ask),r.a.createElement("li",null,r.a.createElement("b",null,"time:")," ",c[e].time)))}))))}}]),t}(r.a.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));c.a.render(r.a.createElement(I,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}},[[14,2,1]]]);
//# sourceMappingURL=main.a35a724e.chunk.js.map