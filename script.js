//get files uploading
const imageUpload = document.getElementById('imageUpload')

//load models and APIs to be using--loading from models folder
Promise.all([ //promise.all means return all together / synchronize
  //loading 3 different libraries
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  //allows algorithm to detect where actual character's faces are
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  //allows algorithm to detect which ones are faces
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start) //after finishing all of it, call method start() which starts program

async function start() {
  const container = document.createElement('div')
  container.style.position = 'relative'
  document.body.append(container)
  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
  let image
  let canvas
  //the document shows that it loaded after page loads
  document.body.append('Loaded: Finished training images. ')
  imageUpload.addEventListener('change', async () => {
    if (image) image.remove()
    if (canvas) canvas.remove()
    image = await faceapi.bufferToImage(imageUpload.files[0])
    container.append(image)
    canvas = faceapi.createCanvasFromMedia(image)
    container.append(canvas)
    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))

    document.body.append(" Number of faces detected in image: ")

    document.body.append(detections.length)

    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      // console.log("result", result)
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
      drawBox.draw(canvas)
    })
  })
}

function loadLabeledImages() {
  console.log("hello")
  const labels = ['Alex Guevara', 'Ava Biery', 'Black Widow','Captain America', 'Captain Marvel', 'Danny Xu', 'Hawkeye', 'Jessica Peng', 'Jim Rhodes', 'Juliana Fogg', 'Thor', 'Tony Stark']
  console.log(labels)
  return Promise.all(
    labels.map(async label => {
      const descriptions = [] //initliaze empty array
            var personDiv = document.createElement("div")
            var text = document.createTextNode(label);
            personDiv.appendChild(text)
            var peopleDiv = document.getElementById('people');
            // personDiv.innerHTML("<h1>sldkfdsf</h1>")
            console.log('person', personDiv)
            peopleDiv.append(personDiv);
            // peopleDiv.innerHTML = personDiv.innerText

            console.log('PERSON: ' + label, personDiv)
      if(label == 'Alex Guevara') console.log("!!!! alex guevara !!!!")
      // const descriptions = []
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/jessicapeng/FacialRecTraining/master/labeled_images/${label}/${i}.jpg`)
        // console.log(img)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
        // console.log("detection is ", detections.descriptor)
      }
      // console.log("THE DESCRIPTION IS", descriptions)
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}
