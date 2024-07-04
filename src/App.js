

// ########### FOR sendParcel.HTML ############



// EVENT ON SENDING DATA
const sendParcel= document.getElementById('sendParcelSubmit')

if(sendParcel){
sendParcel.addEventListener('click', (event) => {
    event.preventDefault();
    const data = {
        senderName: document.getElementById('senderName').value,
        senderPno: document.getElementById('senderPno').value,
        senderEmail: document.getElementById('senderEmail').value,
        senderAddress: document.getElementById('senderAddress').value,
        receiverAddress: document.getElementById('receiverAddress').value,
        receiverPno: document.getElementById('receiverPno').value,
        parcelName: document.getElementById('parcelName').value,
        ParcelWeight: document.getElementById('parcelWeight').value,
        ParcelDate: document.getElementById('date').value,
        employee: document.getElementById('emp').value
    };

    console.log("Sending data:", data);  

    fetch(`http://localhost:3000/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            alert("Parcel Sent Successfully!!");
            return response.json();
        } else {
            throw new Error("Failed to send parcel");
        }
    })
    .catch(()=>{
        alert("Parcel Sent Successfully!!")
    })
});

}

// #############################################################




// ########### FOR DELETEPARCEL.HTML ############


//EVENT ON SEARCHING DATA
const findOrder =  document.getElementById('FindOrderBtn');
if(findOrder){
findOrder.addEventListener('click', (e) => {
        e.preventDefault(); 

        const orderId = document.getElementById('orderID').value

        fetch(`http://localhost:3000/order?id=${orderId}`)
        .then( response => {
            if(!response.ok){
                alert(`NO ORDER FOUND WITH ORDER ID: ${orderId}`)
            }
            else{
                return response.json()
            }
        } )

        .then( data => {
           document.querySelector('section').innerHTML+=
           `
           <table class="table table-striped mt-4">
           <thead>
             <tr>
               <th scope="col">Sender Name</th>
               <th scope="col">Sender P.NO</th>
               <th scope="col">Sender Email</th>
               <th scope="col">Employee ID</th>
               <th scope="col">Delete</th>
             </tr>
           </thead>
           <tbody>
             <tr>
               <td scope="row">${data[0].senderName}</td>           
               <td scope="row">${data[0].senderPhone}</td>           
               <td scope="row">${data[0].senderEmail}</td>           
               <td scope="row">${data[0].employee}</td>           
               <td scope="row" class='deleteIcon'><i class="fa-solid fa-trash-can" style="color: #f41010;} "></i></td>           
             </tr>
           </tbody>
       </table>
           `
           const deleteIcon = document.querySelector('.deleteIcon');
           if(deleteIcon){
            deleteIcon.addEventListener('mouseover',()=>{
                deleteIcon.style.cursor='pointer';
            })

                deleteIcon.addEventListener('click',() =>{
                    fetch(`http://localhost:3000/delete?id=${data[0].id}` , {
                        method:'DELETE'
                    })
                    .then((response)=>response.json())
                    .then((data)=> {
                        alert("Data deleted sucessfully")
                        location.reload();
                    })
                    
                })
           }
        })
    }
);
}

const clrBtn = document.querySelector('.clearBtn');
const findOrderBtn = document.getElementById('FindOrderBtn')? document.getElementById('FindOrderBtn') : document.querySelector('.parcelSlip')? document.querySelector('.parcelSlip')  :  document.getElementById('FindOrder');

if(clrBtn){
    document.addEventListener('keypress' , (event)=>{
        if(event.keyCode == 13){
            event.preventDefault();
            findOrderBtn.click()
        }
    })
}


// ##########################################################


// ############# ORDER HISTORY ######################

const orderHistory = document.querySelector('.orderHistory')
if(orderHistory){
    fetch('http://localhost:3000/order?id=*')
    .then((response) => response.json())
    .then((data)=>{
        data.rows.sort((a,b) => a[0]-b[0])
        for(let i=data.rows.length-1 ; i>=0 ; i--){
            document.querySelector('tbody').innerHTML+=
            `
            <tr>
            <td>${data.rows[i][0]}</td>
            <td>${data.rows[i][1]}</td>
            <td>${data.rows[i][2]}</td>
            <td>${data.rows[i][6]}</td>
            <td>${data.rows[i][7]}</td>
            <td>${data.rows[i][10]}</td>
        </tr>
            `
        }
    })
}

// ####################################################


//###################### FOR PRICETABLE.HTML ######################

var priceTable = document.querySelector('.pricetable');

if(priceTable){
    fetch('http://localhost:3000/order?id=@')
    .then((response)=>response.json())
    .then((data)=>{
       let priceTable = document.querySelector('.pricetable tbody');
        for(let i=0; i<data.rows.length ; i++){
            priceTable.innerHTML+=
            `
            <tr>
            <th scope="row">${i+1}</th>
            <td>${data.rows[i][0]}</td>
            <td>${data.rows[i][1]}</td>
          </tr>
            `
        }
       
    })
}

let increasePrice = document.querySelector('.increasePrice');
if(increasePrice){
   increasePrice.addEventListener('click',()=>{
        let Increament = +prompt("Enter Increament Percentage % (0 to cancel): ");
        if(Increament != 0){

        
        fetch('http://localhost:3000/update',{
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body:JSON.stringify( {
                Increament : Increament,
            })
        })
        .then((response)=>{
            if(response.ok){
                alert("Price Increased Sucessfully!!")
            }
      
        })
    }

    })
}

 
// ##########################################################3


// ############## FOR TRACKING ORDER #######################

const trackOrder =  document.querySelector('.trackOrder');
if(trackOrder){

    trackOrder.addEventListener('click',(e)=>{

        e.preventDefault(); 

        const orderId = document.getElementById('orderID').value

        fetch(`http://localhost:3000/order?id=${orderId}`)
        .then( response => {
            if(!response.ok){
                alert(`NO ORDER FOUND WITH ORDER ID: ${orderId}`)
            }
            else{
                return response.json()
            }
        } )

        .then( data => {
           document.querySelector('section').innerHTML+=
           `
           <table class="table table-striped mt-4">
           <thead>
             <tr>
               <th scope="col">Sender Name</th>
               <th scope="col">Sender P.NO</th>
               <th scope="col">Sender Email</th>
               <th scope="col">Employee ID</th>
               <th scope="col">Order Status</th>
             </tr>
           </thead>
           <tbody>
             <tr>
               <td scope="row">${data[0].senderName}</td>           
               <td scope="row">${data[0].senderPhone}</td>           
               <td scope="row">${data[0].senderEmail}</td>           
               <td scope="row">${data[0].employee}</td>           
               <td scope="row">${data[0].status}</td>           
             </tr>
           </tbody>
       </table>
       <div class="mt-5">
       <h3 class=" d-inline-block">Change Order Status: </h3>
       <button class="btn btn-success ml-4 updateStatus1">Delivered</button>
       <button class="btn btn-success ml-4 updateStatus2">Received</button>
     </div>
           `
           const updstatus1 = document.querySelector('.updateStatus1')
        const updstatus2 = document.querySelector('.updateStatus2')
        
        if(updstatus1){

            updstatus1.addEventListener('click',()=>{
                fetch('http://localhost:3000/update',{
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body:JSON.stringify( {
                        status : updstatus1.innerText,
                        id : orderId,
                    })
                })
                .then((response)=>{
                    if(response.ok){
                        alert("Status Updated Sucessfully!!")
                        location.reload()
                    }
                 
                })
               
            
        })
    }
        if(updstatus2){
          
            updstatus2.addEventListener('click',()=>{
                fetch('http://localhost:3000/update',{
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body:JSON.stringify( {
                        status : updstatus2.innerText,
                        id : orderId,
                    })
                })
                .then((response)=>{
                    if(response.ok){
                        alert("Status Updated Sucessfully!!")
                        location.reload()
                    }
                  
                })
          
        })
    }
        })
        
    })
}


// #######################################################



//############### FOR PRINT SLIP ##########################

const printSlip = document.querySelector('.parcelSlip');
const orderID = document.getElementById('orderID')
if(printSlip){
   printSlip.addEventListener('click', (event)=>{
    event.preventDefault()
    
    fetch(`http://localhost:3000/order?id=${orderID.value}`)
    .then(response => {
        if(!response.ok){
            alert(`NO ORDER FOUND WITH ORDER ID: ${orderID.value}`)
        }
      return  response.json()})
    .then(data => {
        var price;
        for(let i =0 ; i< data[0].range.length ; i++){
            if(data[0].range[i][0].slice(0,1) == data[0].weight_range.slice(0,1).toUpperCase()){
                price = data[0].range[i][1].toFixed(0)
            }
        }
        document.querySelector('section').innerHTML+=
        `
        <table class="table table-striped mt-4" id ="parcelSlip"  style="background-color: none;">
        <thead>
          <tr>
            <th scope="col">Sender Name</th>
            <th scope="col">Sender P.NO</th>
            <th scope="col">Sender Email</th>
            <th scope="col">Receiver Phone</th>
            <th scope="col">Receiver Address</th>
            <th scope="col">Employee ID</th>
            <th scope="col">Weight Range</th>
            <th scope="col">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td scope="row">${data[0].senderName}</td>           
            <td scope="row">${data[0].senderPhone}</td>           
            <td scope="row">${data[0].senderEmail}</td>           
            <td scope="row">${data[0].receiverPhone}</td>           
            <td scope="row">${data[0].receiverAddress}</td>           
            <td scope="row">${data[0].employee}</td>           
            <td scope="row">${data[0].weight_range}</td>           
            <td scope="row">${price}</td>           
          </tr>
        </tbody>
    </table>
 <button class="btn btn-primary" onclick="downloadPDF()">Download PDF</button>
        `
    })

   })
}





// ############ FOR DOWNLOADING PDF ##################
// Function to download PDF
async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const element = document.getElementById('parcelSlip');
    const scale = 10; // Scale for higher resolution
    const canvas = await html2canvas(element, { scale: scale, backgroundColor: 'black' });
    const imgData = canvas.toDataURL('image/png');

    const imgWidth = 190; // Width in mm
    let imgHeight = (canvas.height * imgWidth) / canvas.width; // Initial height calculation
    let positionX = (doc.internal.pageSize.getWidth() - imgWidth) / 2; // Horizontal position for centering
    let positionY = 10; // Vertical position
    let position = 0;

    // Increase the pageHeight to accommodate the increased table height
    const pageHeight = imgHeight > 290 ? imgHeight + 10 : 290;

    let heightLeft = imgHeight;

    doc.addImage(imgData, 'PNG', positionX, positionY, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', positionX, positionY + position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }

    doc.save('Slip.pdf');
}
