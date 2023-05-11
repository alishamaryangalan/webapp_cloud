module.exports = (sequelize, Sequelize) => {
    const Image = sequelize.define("image", {
        product_id: {
            type: Sequelize.STRING
        },
        file_name: {
            type: Sequelize.STRING
        },
        date_created: {
            type: Sequelize.STRING
        },
        s3_bucket_path: {
            type: Sequelize.STRING
        }
    },
    {
        freezeTableName: true, // Model tableName will be the same as the model name
        timestamps: false,
        underscored: true
    }
    );
    return Image
}