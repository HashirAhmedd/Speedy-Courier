const express = require('express');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Oracle DB connection configuration
const dbconfig = {
    user: 'username',
    password: 'pass',
    connectionString: 'localhost:1522/orcl'
};

async function insertParcelData(data) {
    let connection;
    try {
        console.log("Attempting to connect to the database...");
        connection = await oracledb.getConnection(dbconfig);
        console.log("Database connection established.");

        const result = await connection.execute(
            `INSERT INTO system.PARCELS (sender_name, sender_phone, sender_email, sender_address, receiver_address, receiver_phone, parcel_name, parcel_weight, parcel_date)
             VALUES (:senderName, :senderPno, :senderEmail, :senderAddress, :receiverAddress, :receiverPno, :parcelName, :parcelWeight, TO_DATE(:parcelDate, 'YYYY-MM-DD'))`,
            [data.senderName, data.senderPno, data.senderEmail, data.senderAddress, data.receiverAddress, data.receiverPno, data.parcelName, data.ParcelWeight, data.ParcelDate],
            { autoCommit: true }
        );
        console.log("Rows inserted:", result.rowsAffected);

    } catch (error) {
        console.log("Error while inserting data:", error);
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log("Database connection closed.");
            } catch (err) {
                console.log("Error while closing the database connection:", err);
            }
        }
    }
}

// Handle Form submission
app.post('/submit', async (req, res) => {
    const data = req.body;

    try {
        await insertParcelData(data);
        res.json({ message: 'Parcel data inserted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to insert Parcel data', error: err.message });
    }
});


// HANDLE ORDER SEARCHING
async function getOrderById(orderId) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbconfig);
        if(orderId == '*'){
            const result = await connection.execute(
                `SELECT * FROM PARCELS`
            );
            return result;
        }
        else if(orderId == '@'){
            const result = await connection.execute(
                `SELECT * FROM system.price`
            );

            return result;
        }

        else{
            const result = await connection.execute(
                `SELECT * FROM system.PARCELS WHERE ID = :id`,
                [orderId]
            );
            // Map the array of arrays to an array of objects
            const formattedData = result.rows.map(row => {
                return {
                    id: row[0],
                    senderName: row[1],
                    senderPhone: row[2],
                    senderEmail: row[3],
                    senderAddress: row[4],
                    receiverAddress: row[5],
                    receiverPhone: row[6],
                    // Add more properties as needed
                };
            });
            return formattedData;
        }

    } catch (error) {
        console.error("Error while fetching order:", error);
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log("Database connection closed.");
            } catch (err) {
                console.error("Error while closing the database connection:", err);
            }
        }
    }
}

// Route for fetching an order by ID
app.get('/order', async (req, res) => {
    const orderId = req.query.id;
    console.log("Fetching order with ID:", orderId);

    try {
        const order = await getOrderById(orderId);
        if ( order.length === 0) {
            console.log("ORder not found")
            res.status(404).json({ message: 'Order not found' });
        } else {
            console.log("ORder found")
            if(orderId == '*' || orderId =='@'){
                res.send(order)
            }
            else{
                res.json(order);
            }
        }
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch order data', error: err.message });
    }
});



// HANDLE DATA DELETION

 async function deleteOrder(orderId){
    let connection;
    try{
        connection = await oracledb.getConnection(dbconfig);
        const result = await connection.execute(
            `delete from system.PARCELS where ID = :id`,
            [orderId],   { autoCommit: true }
        );
        console.log(result)
    }
    catch(error){
        console.log("ERROR WHILE DELETING DATA: "+error.message)
    }
    finally{
        if(connection){
            try{
                await connection.close();
                console.log("Database Connection Closed.");
            }
            catch(err){
                console.log("Error While closing the database connection:",err)
            }
        }
    }
 }

app.delete('/delete', async (req , res)=>{
    const orderId = req.query.id;
    console.log(`Deleting Order with ID ${orderId}`)
    try{
        const orderDelete  = await deleteOrder(orderId);
        if(orderDelete && orderDelete.rowsAffected>0){
            console.log("Order Deleted Sucessfully!!");
            res.status(200).json({ message: "Order Deleted Successfully!!" });
        }
        else{
            res.status(404).json({ message: "Order Not Found" });
        }

    }
    catch(err){
        console.log("ERROR: "+err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
})




//####### FOR PRICE UPDATE ############


async function updatePrice(incr){
    let connection;
    try{
        connection = await oracledb.getConnection(dbconfig);
        const result = await connection.execute(
            `UPDATE price
             SET Price = Price * (1 + :incr / 100)`,
            [incr],
            { autoCommit: true }
        );
    }
    catch(error){
        console.log("ERROR WHILE UPDATING DATA: "+error.message)
    }
    finally{
        if(connection){
            try{
                await connection.close();
                console.log("Database Connection Closed.");
            }
            catch(err){
                console.log("Error While closing the database connection:",err)
            }
        }
    }
}

app.put('/update',async(req , res)=>{
    const incr = req.body.Increament;
    try{
        const update = await updatePrice(incr);
        res.send(update)
    }
    catch(err){
        console.log(err)
    }
})






app.listen(port, () => console.log(`Server running at http://localhost:${port}/`));
