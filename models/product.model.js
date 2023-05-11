module.exports = (sequelize, Sequelize) => {
    const Product = sequelize.define("products", 
    {
        name:{ type: Sequelize.STRING },
        description: { type: Sequelize.STRING },
        sku:{ type: Sequelize.STRING },
        manufacturer:{ type: Sequelize.STRING },
        quantity:{ type: Sequelize.INTEGER },
        date_added:{ type: Sequelize.STRING },
        date_last_updated:{ type: Sequelize.STRING },
        owner_user_id:{ type: Sequelize.INTEGER }
    },
    {
        freezeTableName: true, // Model tableName will be the same as the model name
        timestamps: false,
        underscored: true
    }
    );
    return Product
}