const videoData = {
  tools: {
    src: "../../assets/Video/Basic Tools & Shapes.mp4",
    desc: "In this beginner-friendly Adobe Illustrator tutorial, Imran Ali Dina from GFXMentor introduces the essential tools and interface of Illustrator, focusing on creating basic shapes like rectangles, squares, and polygons, and teaching how to use the selection tool for resizing, rotating, and duplicating objects efficiently."
  },
  trace: {
    src: "../../assets/Video/Tracing Logos.mp4",
    desc: "In this lesson, Imran Ali Dina teaches how to trace a logo using the Pen Tool, organize work using Layers, and refine shapes with the Shape Builder Tool in Adobe Illustrator. By using a Memphis Grizzlies logo as an example, he demonstrates embedding images, locking template layers, drawing vector shapes, and cleaning up outlines for precise, scalable results—perfect for beginners aiming to master vector tracing techniques."
  },
  guide: {
    src: "../../assets/Video/Full Guide for Beginners.mp4",
    desc: "In this 5th Illustrator class, Imran Ali Dina from GFXMentor explains everything about strokes in Adobe Illustrator. He covers stroke alignment, weight, dash patterns, caps, joins, arrowheads, and introduces the Paint Brush, Blob Brush, Eraser, Path Eraser, Scissor, Knife, Shaper, and Join Tools. This lesson helps beginners fully understand how to use strokes and related tools to create and manipulate vector paths effectively."
  },
  watch: {
    src: "../../assets/Video/Create a Vector Wristwatch.mp4",
    desc: "In this detailed Adobe Illustrator tutorial, Imran Ali Dina from GFXMentor teaches the complete use of the Rotate Tool, covering pivot points, Alt+click duplication, Ctrl+D repetition, precise angle calculation, and alignment techniques. As a practical exercise, you’ll learn to design a flat vector wristwatch using rotation for dial markers and hands, along with essential tools like shape builder, alignment panel, drop shadows, and more—ideal for beginners wanting to master rotation and object arrangement in Illustrator."
  },
  layers: {
    src: "../assets/layers.mp4",
    desc: "Understand how to use layers, templates, and locking for organized, efficient designing."
  },
  shape: {
    src: "../assets/shape.mp4",
    desc: "Discover how to use the shape builder and pathfinder tools to combine or subtract vector shapes."
  },
  pen: {
    src: "../assets/pen.mp4",
    desc: "Detailed practice with the pen tool, tracing complex shapes and understanding anchor points."
  }
};

// Define the order of videos for navigation
const videoOrder = ['tools', 'trace', 'guide', 'watch', 'layers', 'shape', 'pen'];
let currentVideoIndex = 0;

function loadContent(key) {
  const videoPlayer = document.getElementById("videoPlayer");
  const videoSource = document.getElementById("videoSource");
  const descriptionText = document.getElementById("descriptionText");

  videoSource.src = videoData[key].src;
  videoPlayer.load();
  descriptionText.textContent = videoData[key].desc;
  
  // Update current video index
  currentVideoIndex = videoOrder.indexOf(key);
  updateNavigationButton();
  
  // Update sidebar active state
  updateSidebarActiveState(key);
}

function updateNavigationButton() {
  const nextButton = document.getElementById("nextButton");
  
  if (currentVideoIndex === videoOrder.length - 1) {
    // Last video - show complete button
    nextButton.textContent = "Complete";
    nextButton.className = "nav-btn complete-btn";
  } else {
    // Not last video - show next button
    nextButton.textContent = "Next";
    nextButton.className = "nav-btn next-btn";
  }
}

function nextVideo() {
  if (currentVideoIndex < videoOrder.length - 1) {
    currentVideoIndex++;
    const nextKey = videoOrder[currentVideoIndex];
    loadContent(nextKey);
  }
}

function updateSidebarActiveState(key) {
  const sidebarItems = document.querySelectorAll('.sidebar li');
  sidebarItems.forEach((item) => {
    item.classList.remove('active');
    if (item.onclick.toString().includes(key)) {
      item.classList.add('active');
    }
  });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  // Set initial video
  loadContent('tools');
  
  // Add click event to next button
  const nextButton = document.getElementById("nextButton");
  nextButton.addEventListener('click', function() {
    if (currentVideoIndex === videoOrder.length - 1) {
      window.location.href = "../Skill Test/index.html";
    } else {
      nextVideo();
    }
  });
  
  // Set initial active state for first sidebar item
  const firstSidebarItem = document.querySelector('.sidebar li');
  if (firstSidebarItem) {
    firstSidebarItem.classList.add('active');
  }
});
