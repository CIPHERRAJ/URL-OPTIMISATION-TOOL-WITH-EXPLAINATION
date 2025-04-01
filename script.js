document.addEventListener('DOMContentLoaded', function() {
    // Initialize all tools
    initUrlOptimizer();
    initSiteStructureVisualizer();

    // Add a window load event to ensure all resources are loaded
    window.addEventListener('load', function() {
        // Hide loading indicators or show content as needed
        document.querySelectorAll('.demo-panel').forEach(panel => {
            panel.classList.add('loaded');
        });
    });
});

/* URL Optimizer Tool */
function initUrlOptimizer() {
    const originalUrlInput = document.getElementById('original-url');
    const optimizeButton = document.getElementById('optimize-button');
    const originalUrlDisplay = document.getElementById('original-url-display');
    const optimizedUrlDisplay = document.getElementById('optimized-url');
    const urlAnalysis = document.getElementById('url-analysis');
    const resultsDiv = document.querySelector('.results');

    // Initialize the results div as hidden
    if (resultsDiv) {
        resultsDiv.style.display = 'none';
    }

    if (optimizeButton) {
        optimizeButton.addEventListener('click', function() {
            const url = originalUrlInput.value.trim();
            
            if (url === '') {
                alert('Please enter a URL to optimize');
                return;
            }

            // Display the original URL
            originalUrlDisplay.textContent = url;
            
            // Generate optimized URL and analysis
            const { optimizedUrl, analysis } = optimizeUrl(url);
            
            // Display results
            optimizedUrlDisplay.textContent = optimizedUrl;
            
            // Clear previous analysis
            urlAnalysis.innerHTML = '';
            
            // Add analysis points
            analysis.forEach(point => {
                const li = document.createElement('li');
                li.innerHTML = point;
                urlAnalysis.appendChild(li);
            });
            
            // Show results
            resultsDiv.style.display = 'block';
        });
    }
}

function optimizeUrl(url) {
    try {
        const parsedUrl = new URL(url);
        let path = parsedUrl.pathname;
        const hostname = parsedUrl.hostname;
        const protocol = parsedUrl.protocol;
        const searchParams = parsedUrl.searchParams;
        
        const analysis = [];
        
        // Start with a clean optimized URL
        let optimizedPath = path;
        
        // Check and remove trailing slashes
        if (path.endsWith('/') && path.length > 1) {
            optimizedPath = path.slice(0, -1);
            analysis.push('Removed trailing slash for cleaner URL');
        }
        
        // Remove file extensions like .html, .php, etc.
        if (/\.(html|php|asp|jsp)$/.test(optimizedPath)) {
            optimizedPath = optimizedPath.replace(/\.(html|php|asp|jsp)$/, '');
            analysis.push('Removed file extension for cleaner URL');
        }
        
        // Convert uppercase to lowercase
        if (optimizedPath !== optimizedPath.toLowerCase()) {
            optimizedPath = optimizedPath.toLowerCase();
            analysis.push('Converted URL to lowercase for consistency');
        }
        
        // Replace underscores with hyphens
        if (optimizedPath.includes('_')) {
            optimizedPath = optimizedPath.replace(/_/g, '-');
            analysis.push('Replaced underscores with hyphens for better SEO');
        }
        
        // Handle query parameters - convert to path segments if appropriate
        if (searchParams.toString()) {
            let newPathSegments = [];
            let foundKeywords = false;
            
            // Check for common ID parameters
            if (searchParams.has('id')) {
                // Skip numeric-only IDs as they're not SEO-friendly
                const id = searchParams.get('id');
                if (!/^\d+$/.test(id)) {
                    newPathSegments.push(id);
                    foundKeywords = true;
                }
            }
            
            // Check for category parameter
            if (searchParams.has('category') || searchParams.has('cat')) {
                const category = searchParams.get('category') || searchParams.get('cat');
                newPathSegments.push(category);
                foundKeywords = true;
            }
            
            // Check for product name, article title, etc.
            if (searchParams.has('name') || searchParams.has('title')) {
                const name = searchParams.get('name') || searchParams.get('title');
                newPathSegments.push(name);
                foundKeywords = true;
            }
            
            if (foundKeywords) {
                // Create a clean path from keywords
                const keywordPath = newPathSegments
                    .join('-')
                    .toLowerCase()
                    .replace(/[^\w-]+/g, '-')
                    .replace(/--+/g, '-')
                    .replace(/^-|-$/g, '');
                
                optimizedPath = optimizedPath.replace(/\/$/, '') + '/' + keywordPath;
                analysis.push('Converted query parameters to SEO-friendly path segments');
            } else {
                analysis.push('Warning: URL has query parameters which are not ideal for SEO');
            }
        }
        
        // Check for common non-SEO friendly words in URL segments
        const unfriendlyWords = ['page', 'article', 'post', 'content'];
        let pathSegments = optimizedPath.split('/').filter(segment => segment !== '');
        
        if (pathSegments.some(segment => unfriendlyWords.includes(segment.toLowerCase()))) {
            pathSegments = pathSegments.filter(segment => !unfriendlyWords.includes(segment.toLowerCase()));
            optimizedPath = '/' + pathSegments.join('/');
            analysis.push('Removed generic terms like "page" or "article" that add no SEO value');
        }
        
        // Check for date segments in URL (common in blog posts)
        const datePattern = /^\d{4}\/\d{2}\/\d{2}$/;
        if (pathSegments.length >= 3 && datePattern.test(pathSegments.slice(0, 3).join('/'))) {
            // Keep the date but suggest a different format
            analysis.push('Consider moving date information to the end of the URL for better keyword prominence');
        }
        
        // Construct the full optimized URL
        const optimizedUrl = `${protocol}//${hostname}${optimizedPath}`;
        
        // Add general analysis
        if (optimizedPath === path && !searchParams.toString()) {
            analysis.push('URL already follows good SEO practices!');
        }
        
        // Length analysis
        if (optimizedUrl.length > 100) {
            analysis.push('Warning: Optimized URL is still quite long. Consider shortening it further.');
        } else if (optimizedUrl.length < 50) {
            analysis.push('Good URL length: Concise URLs are preferable for SEO.');
        }
        
        return {
            optimizedUrl,
            analysis
        };
        
    } catch (error) {
        // Handle invalid URLs
        return {
            optimizedUrl: 'Invalid URL format',
            analysis: ['Error: Could not parse the URL. Please ensure it includes protocol (http:// or https://)']
        };
    }
}

/* Site Structure Visualizer */
function initSiteStructureVisualizer() {
    const siteMap = document.getElementById('site-map');
    const addPageButton = document.getElementById('add-page');
    const addLinkButton = document.getElementById('add-link');
    const resetMapButton = document.getElementById('reset-map');
    
    // Store nodes and edges
    const nodes = [];
    const edges = [];
    
    // Initialize demo with a simple site structure
    initializeDefaultSiteStructure();
    
    // Event listeners for buttons
    if (addPageButton) {
        addPageButton.addEventListener('click', function() {
            const pageName = prompt('Enter page name:');
            if (pageName && pageName.trim() !== '') {
                addNode(pageName.trim());
                renderSiteMap();
            }
        });
    }
    
    if (addLinkButton) {
        addLinkButton.addEventListener('click', function() {
            if (nodes.length < 2) {
                alert('You need at least two pages to create a link.');
                return;
            }
            
            // Create dropdown options
            const options = nodes.map((node, index) => `${index + 1}. ${node.name}`).join('\n');
            
            const fromPage = prompt(`Select source page (enter number):\n${options}`);
            if (!fromPage) return;
            
            const toPage = prompt(`Select target page (enter number):\n${options}`);
            if (!toPage) return;
            
            const fromIndex = parseInt(fromPage) - 1;
            const toIndex = parseInt(toPage) - 1;
            
            if (isNaN(fromIndex) || isNaN(toIndex) || 
                fromIndex < 0 || fromIndex >= nodes.length || 
                toIndex < 0 || toIndex >= nodes.length) {
                alert('Invalid selection.');
                return;
            }
            
            // Add the edge
            const linkText = prompt('Enter anchor text for this link:');
            if (linkText && linkText.trim() !== '') {
                addEdge(fromIndex, toIndex, linkText.trim());
                renderSiteMap();
            }
        });
    }
    
    if (resetMapButton) {
        resetMapButton.addEventListener('click', function() {
            nodes.length = 0;
            edges.length = 0;
            initializeDefaultSiteStructure();
            renderSiteMap();
        });
    }
    
    function initializeDefaultSiteStructure() {
        // Add default nodes
        nodes.push(
            { name: 'Home', color: '#3498db', x: 50, y: 50 },
            { name: 'Products', color: '#e74c3c', x: 200, y: 50 },
            { name: 'About', color: '#2ecc71', x: 50, y: 150 },
            { name: 'Contact', color: '#f39c12', x: 200, y: 150 }
        );
        
        // Add default edges
        edges.push(
            { from: 0, to: 1, text: 'Our Products' },
            { from: 0, to: 2, text: 'About Us' },
            { from: 0, to: 3, text: 'Contact Us' },
            { from: 1, to: 3, text: 'Get Support' }
        );
        
        renderSiteMap();
    }
    
    function addNode(name) {
        // Calculate position based on golden ratio spiral
        const i = nodes.length;
        const angle = i * 137.5 * (Math.PI / 180);
        const radius = Math.sqrt(i) * 30;
        const x = 150 + radius * Math.cos(angle);
        const y = 150 + radius * Math.sin(angle);
        
        // Generate a color
        const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
        const color = colors[i % colors.length];
        
        nodes.push({ name, color, x, y });
    }
    
    function addEdge(fromIndex, toIndex, text) {
        // Check if this edge already exists
        const existingEdge = edges.find(e => e.from === fromIndex && e.to === toIndex);
        if (existingEdge) {
            alert('This link already exists.');
            return;
        }
        
        edges.push({ from: fromIndex, to: toIndex, text });
    }
    
    function renderSiteMap() {
        if (!siteMap) return;
        
        // Clear the site map
        siteMap.innerHTML = '';
        
        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '300');
        svg.setAttribute('viewBox', '0 0 300 300');
        
        // Draw edges first (so they appear behind nodes)
        edges.forEach(edge => {
            const fromNode = nodes[edge.from];
            const toNode = nodes[edge.to];
            
            // Create line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', fromNode.x);
            line.setAttribute('y1', fromNode.y);
            line.setAttribute('x2', toNode.x);
            line.setAttribute('y2', toNode.y);
            line.setAttribute('stroke', '#999');
            line.setAttribute('stroke-width', '2');
            
            // Create arrow
            const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
            const arrowSize = 8;
            const arrowX = toNode.x - arrowSize * Math.cos(angle);
            const arrowY = toNode.y - arrowSize * Math.sin(angle);
            
            const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            arrow.setAttribute('points', `
                ${arrowX},${arrowY} 
                ${arrowX - arrowSize * Math.cos(angle - Math.PI/6)},${arrowY - arrowSize * Math.sin(angle - Math.PI/6)} 
                ${arrowX - arrowSize * Math.cos(angle + Math.PI/6)},${arrowY - arrowSize * Math.sin(angle + Math.PI/6)}
            `);
            arrow.setAttribute('fill', '#999');
            
            // Create edge label
            const textX = (fromNode.x + toNode.x) / 2;
            const textY = (fromNode.y + toNode.y) / 2 - 5;
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', textX);
            text.setAttribute('y', textY);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '10');
            text.setAttribute('fill', '#666');
            text.textContent = edge.text;
            
            svg.appendChild(line);
            svg.appendChild(arrow);
            svg.appendChild(text);
        });
        
        // Draw nodes
        nodes.forEach((node, index) => {
            // Create circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', 15);
            circle.setAttribute('fill', node.color);
            
            // Create text
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', node.x);
            text.setAttribute('y', node.y + 5);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '10');
            text.setAttribute('fill', 'white');
            text.textContent = String(index + 1);
            
            // Create label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', node.x);
            label.setAttribute('y', node.y + 30);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('font-size', '12');
            label.setAttribute('fill', '#333');
            label.textContent = node.name;
            
            svg.appendChild(circle);
            svg.appendChild(text);
            svg.appendChild(label);
        });
        
        siteMap.appendChild(svg);
        
        // Add legend
        const legend = document.createElement('div');
        legend.style.marginTop = '10px';
        legend.style.fontSize = '12px';
        
        const legendTitle = document.createElement('p');
        legendTitle.textContent = 'Pages:';
        legendTitle.style.fontWeight = 'bold';
        legend.appendChild(legendTitle);
        
        const legendList = document.createElement('ul');
        legendList.style.columns = '2';
        legendList.style.listStyleType = 'none';
        legendList.style.padding = '0';
        
        nodes.forEach((node, index) => {
            const item = document.createElement('li');
            const colorBox = document.createElement('span');
            colorBox.style.display = 'inline-block';
            colorBox.style.width = '12px';
            colorBox.style.height = '12px';
            colorBox.style.backgroundColor = node.color;
            colorBox.style.marginRight = '5px';
            
            item.appendChild(colorBox);
            item.appendChild(document.createTextNode(`${index + 1}. ${node.name}`));
            legendList.appendChild(item);
        });
        
        legend.appendChild(legendList);
        siteMap.appendChild(legend);
    }
}


// Helper function to create a random placeholder URL for demo
function getRandomDemoUrl() {
    const domains = ['example.com', 'mysite.org', 'website.net', 'ecommerce.shop'];
    const paths = [
        'products/category/item?id=123&ref=source',
        'blog/article_name.html?category=tech',
        'pages/about_us.php',
        'SERVICES/Professional/CONSULTING.html',
        'directory/sub_directory/file_name.jsp?param=value'
    ];
    
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const path = paths[Math.floor(Math.random() * paths.length)];
    
    return `https://www.${domain}/${path}`;
}

// Set random URL as placeholder on page load
document.addEventListener('DOMContentLoaded', function() {
    const originalUrlInput = document.getElementById('original-url');
    if (originalUrlInput) {
        originalUrlInput.placeholder = getRandomDemoUrl();
    }
});