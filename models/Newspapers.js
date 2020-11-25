const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NewsSchema = new Schema({
    User: {
        type: Schema.Types.ObjectId,
        ref: "MyUsers"
    },
    Newspapers: [
        {
            Image: {
                data: Buffer,
                contentType: String
            },
            Title: { type: String },
            Price: { type: String },
            Language: { type: String },
            Areacode: { type: String }
        }
    ]
});

module.exports = Profile = mongoose.model("Newspapers", NewsSchema);
