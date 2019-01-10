// Quote ========================================

var Quote = exports.Quote = {};

Quote.read = function (pbf, end) {
    return pbf.readFields(Quote._readField, {rec: null, instrumentId: "", bid: "", ask: "", time: 0}, end);
};
Quote._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.rec = Recipient.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 2) obj.instrumentId = pbf.readString();
    else if (tag === 3) obj.bid = pbf.readString();
    else if (tag === 4) obj.ask = pbf.readString();
    else if (tag === 5) obj.time = pbf.readVarint(true);
};
Quote.write = function (obj, pbf) {
    if (obj.rec) pbf.writeMessage(1, Recipient.write, obj.rec);
    if (obj.instrumentId) pbf.writeStringField(2, obj.instrumentId);
    if (obj.bid) pbf.writeStringField(3, obj.bid);
    if (obj.ask) pbf.writeStringField(4, obj.ask);
    if (obj.time) pbf.writeVarintField(5, obj.time);
};

// Recipient ========================================

var Recipient = exports.Recipient = {};

Recipient.read = function (pbf, end) {
    return pbf.readFields(Recipient._readField, {brokerId: 0, accountId: 0}, end);
};
Recipient._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.brokerId = pbf.readVarint(true);
    else if (tag === 2) obj.accountId = pbf.readVarint(true);
};
Recipient.write = function (obj, pbf) {
    if (obj.brokerId) pbf.writeVarintField(1, obj.brokerId);
    if (obj.accountId) pbf.writeVarintField(2, obj.accountId);
};
