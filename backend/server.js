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
    user: 'your database username',
    password: 'your database password',
    connectionString: 'connection string'
};

async function insertParcelData(data) {
    let connection;
    try {
        console.log("Attempting to connect to the database...");
        connection = await oracledb.getConnection(dbconfig);
        console.log("Database connection established.");
        const result = await connection.execute(
            `BEGIN
        insert_parcel_and_customer(
            :receiverAddress, :receiverPno, :parcelName, :parcelWeight, TO_DATE(:parcelDate, 'YYYY-MM-DD'),
            :customerName, :customerPno, :customerEmail, :customerAddress, :employee
        );
     END;`,
    {
        receiverAddress: data.receiverAddress,
        receiverPno: data.receiverPno,
        parcelName: data.parcelName,
        parcelWeight: data.ParcelWeight,
        parcelDate: data.ParcelDate,
        customerName: data.senderName,
        customerPno: data.senderPno,
        customerEmail: data.senderEmail,
        customerAddress: data.senderAddress,
        employee: data.employee
    },
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
      const insert =   await insertParcelData(data);
      res.status(200).json({ message: 'Parcel data inserted successfully' });
    //   res.status(200);
        // res.send({ message: 'Parcel data inserted successfully' });
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
                `SELECT 
    p.ID, 
    c.customer_name, 
    c.customer_phone, 
    c.customer_email, 
    c.customer_address, 
    p.receiver_address, 
    p.receiver_phone,
    p.parcel_name, 
    p.parcel_weight, 
    p.parcel_date,
    p.employee_id
FROM 
    parcels p
JOIN 
    customers c 
ON 
    p.id = c.customer_id`
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
                `SELECT 
    p.ID, 
    c.customer_name, 
    c.customer_phone, 
    c.customer_email, 
    c.customer_address, 
    p.receiver_address, 
    p.receiver_phone,
    p.employee_id,
    p.parcel_weight
FROM 
    parcels p
JOIN 
    customers c 
ON 
    p.id = c.customer_id
    where p.id = :orderId
    `,[orderId]
            );
            try{

                const result2 = await connection.execute(
                    `SELECT * FROM system.trackings WHERE ORDER_ID = :id`,
                    [orderId]
                );
                var orderStatus = result2.rows[0][1]
                const result3 = await connection.execute(
                    `select * from system.price`
                );
                var price = result3;
            }
            catch{
                
            }
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
                    employee: row[7],
                    status : orderStatus,
                    range: price.rows,
                    weight_range : row[8]
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

//####### FOR STATUS UPDATE ############


async function updateStatus(orderStatus,id){
    let connection;
    try{
        connection = await oracledb.getConnection(dbconfig);
        const result = await connection.execute(
            `UPDATE trackings
             SET STATUS = :status
             where ORDER_ID = :id`,
            [orderStatus, id],
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
    const orderStatus = req.body.status
    const orderId = req.body.id
    try{
        if(incr){
            var update = await updatePrice(incr);
        }
        else if(orderStatus){
            var update = await updateStatus(orderStatus,orderId);
        }
        res.send(update)
    }
    catch(err){
        console.log(err)
    }
})









app.listen(port, () => console.log(`Server running at http://localhost:${port}/`));
