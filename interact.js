// interact.js
document.addEventListener('DOMContentLoaded', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const container = document.getElementById('container');
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1; // Close zoom
    controls.maxDistance = 2000; // Increased limit to view up to last planet and beyond with limit

    // High-quality background (Milky Way stars) with error logging
    const backgroundLoader = new THREE.TextureLoader();
    backgroundLoader.load(
        './textures/2k_stars_milky_way.jpg',
        (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.background = texture;
            console.log('Background loaded successfully');
        },
        undefined,
        (err) => console.error('Failed to load background ./textures/2k_stars_milky_way.jpg:', err)
    );

    // Ambient light for subtle visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    // Sun (center, glowing, clickable)
    const sunGeometry = new THREE.SphereGeometry(10, 64, 64);
    const sunLoader = new THREE.TextureLoader();
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Fallback yellow
    sunLoader.load(
        './textures/2k_sun.jpg',
        (texture) => {
            sunMaterial.map = texture;
            sunMaterial.needsUpdate = true;
            console.log('Sun texture loaded');
        },
        undefined,
        (err) => console.error('Failed to load sun:', err)
    );
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.userData = {
        name: 'Sun',
        diameter: '1,392,000 km',
        distSun: '0 (center)',
        orbPeriod: 'N/A',
        rotPeriod: '25-35 days',
        moons: 'N/A',
        funFact: 'The Sun is a star that gives us light and heat. It\'s 109 times wider than Earth!',
        sizeComparison: 'Larger than Earth (diameter 109 times Earth)',
        massComparison: 'Mass: 333,000 times Earth'
    };
    scene.add(sun);

    const sunLight = new THREE.PointLight(0xffffff, 3, 0, 0);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 5000;
    scene.add(sunLight);

    // Planets data - ALL 2K local files (smaller size, faster loading)
    const earthRadius = 1;
    const auScale = 50;
    const planetsData = [
        {
            name: 'Mercury',
            radius: 0.383 * earthRadius,
            distance: 0.387 * auScale,
            orbitalPeriod: 0.241,
            rotationPeriod: 1407.6,
            texture: './textures/2k_mercury.jpg',
            normalMap: null,
            diameter: '4,879 km',
            distSun: '0.39 AU',
            orbPeriod: '88 days',
            rotPeriod: '59 days',
            moons: '0',
            funFact: 'Mercury is the smallest planet and closest to the Sun. It has no moons and a day longer than its year!',
            sizeComparison: 'Smaller than Earth (diameter 38% of Earth)',
            massComparison: 'Mass: 5.5% of Earth'
        },
        {
            name: 'Venus',
            radius: 0.949 * earthRadius,
            distance: 0.723 * auScale,
            orbitalPeriod: 0.615,
            rotationPeriod: -5832.5,
            texture: './textures/2k_venus_surface.jpg',        // surface
            normalMap: './textures/2k_venus_atmosphere.jpg',   // atmosphere
            diameter: '12,104 km',
            distSun: '0.72 AU',
            orbPeriod: '225 days',
            rotPeriod: '243 days (retrograde)',
            moons: '0',
            funFact: 'Venus is the hottest planet with thick clouds. It spins backwards and has no moons!',
            sizeComparison: 'Slightly smaller than Earth (diameter 95% of Earth)',
            massComparison: 'Mass: 81.5% of Earth'
        },
        {
            name: 'Earth',
            radius: earthRadius,
            distance: 1 * auScale,
            orbitalPeriod: 1,
            rotationPeriod: 23.93,
            texture: './textures/2k_earth_daymap.jpg',
            cloudsTexture: './textures/2k_earth_clouds.jpg',
            normalMap: './textures/2k_earth_normal_map.tif',
            specularMap: './textures/2k_earth_specular_map.tif',
            tilt: 23.44,
            diameter: '12,756 km',
            distSun: '1 AU',
            orbPeriod: '365 days',
            rotPeriod: '24 hours',
            moons: '1',
            funFact: 'Earth is our home with water and life. It has one moon and four seasons due to its tilt!',
            sizeComparison: 'Our home planet!',
            massComparison: 'Mass: 1 Earth (reference)'
        },
        {
            name: 'Mars',
            radius: 0.532 * earthRadius,
            distance: 1.524 * auScale,
            orbitalPeriod: 1.881,
            rotationPeriod: 24.62,
            texture: './textures/2k_mars.jpg',
            normalMap: null,
            diameter: '6,792 km',
            distSun: '1.52 AU',
            orbPeriod: '687 days',
            rotPeriod: '25 hours',
            moons: '2',
            funFact: 'Mars is the red planet with the tallest volcano. It has two small moons and dusty storms!',
            sizeComparison: 'Smaller than Earth (diameter 53% of Earth)',
            massComparison: 'Mass: 10.7% of Earth'
        },
        {
            name: 'Jupiter',
            radius: 11.209 * earthRadius,
            distance: 5.204 * auScale,
            orbitalPeriod: 11.862,
            rotationPeriod: 9.93,
            texture: './textures/2k_jupiter.jpg',
            normalMap: null,
            diameter: '142,984 km',
            distSun: '5.2 AU',
            orbPeriod: '12 years',
            rotPeriod: '10 hours',
            moons: '95',
            funFact: 'Jupiter is the biggest planet, a gas giant with a big red spot storm. It has 95 moons!',
            sizeComparison: 'Larger than Earth (diameter 11 times Earth)',
            massComparison: 'Mass: 317.8 times Earth'
        },
        {
            name: 'Saturn',
            radius: 9.449 * earthRadius,
            distance: 9.582 * auScale,
            orbitalPeriod: 29.457,
            rotationPeriod: 10.66,
            texture: './textures/2k_saturn.jpg',
            normalMap: null,
            ringTexture: './textures/2k_saturn_ring_alpha.png',
            diameter: '120,536 km',
            distSun: '9.58 AU',
            orbPeriod: '29 years',
            rotPeriod: '11 hours',
            moons: '146',
            funFact: 'Saturn has beautiful rings made of ice. It\'s a gas giant with 146 moons!',
            sizeComparison: 'Larger than Earth (diameter 9.5 times Earth)',
            massComparison: 'Mass: 95.2 times Earth'
        },
        {
            name: 'Uranus',
            radius: 4.007 * earthRadius,
            distance: 19.191 * auScale,
            orbitalPeriod: 84.020,
            rotationPeriod: -17.24,
            texture: './textures/2k_uranus.jpg',
            normalMap: null,
            diameter: '51,118 km',
            distSun: '19.2 AU',
            orbPeriod: '84 years',
            rotPeriod: '17 hours (retrograde)',
            moons: '27',
            funFact: 'Uranus is tilted sideways and spins backwards. It has 27 moons and is very cold!',
            sizeComparison: 'Larger than Earth (diameter 4 times Earth)',
            massComparison: 'Mass: 14.5 times Earth'
        },
        {
            name: 'Neptune',
            radius: 3.883 * earthRadius,
            distance: 30.047 * auScale,
            orbitalPeriod: 164.8,
            rotationPeriod: 16.11,
            texture: './textures/2k_neptune.jpg',
            normalMap: null,
            diameter: '49,528 km',
            distSun: '30 AU',
            orbPeriod: '165 years',
            rotPeriod: '16 hours',
            moons: '14',
            funFact: 'Neptune is the windiest planet with dark storms. It has 14 moons and is blue!',
            sizeComparison: 'Larger than Earth (diameter 3.9 times Earth)',
            massComparison: 'Mass: 17.1 times Earth'
        }
    ];

    const planets = [];
    const orbitLines = [];
    const loader = new THREE.TextureLoader();
    planetsData.forEach(data => {
        const geometry = new THREE.SphereGeometry(data.radius, 32, 32); // Optimized segments
        const material = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa, // Fallback
            emissive: data.nightTexture ? 0xffffff : 0x000000,
            emissiveIntensity: data.nightTexture ? 0.6 : 0,
            metalness: 0,
            roughness: 1
        });
        loader.load(data.texture, (tex) => { material.map = tex; material.needsUpdate = true; console.log(`${data.name} texture loaded`); }, undefined, (err) => console.error(`Failed to load ${data.name} texture:`, err));
        if (data.normalMap) loader.load(data.normalMap, (tex) => { material.normalMap = tex; material.needsUpdate = true; console.log(`${data.name} normal loaded`); });
        if (data.specularMap) loader.load(data.specularMap, (tex) => { material.specularMap = tex; material.needsUpdate = true; console.log(`${data.name} specular loaded`); });
        if (data.nightTexture) loader.load(data.nightTexture, (tex) => { material.emissiveMap = tex; material.needsUpdate = true; console.log(`${data.name} nightmap loaded`); });
        const planet = new THREE.Mesh(geometry, material);
        planet.castShadow = true;
        planet.receiveShadow = true;
        planet.userData = data;
        const group = new THREE.Group();
        group.add(planet);
        scene.add(group);
        planets.push({mesh: planet, group, angle: Math.random() * Math.PI * 2, data, clouds: null});

        // Special features
        if (data.name === 'Earth') {
            const cloudsGeometry = new THREE.SphereGeometry(data.radius * 1.01, 32, 32);
            const cloudsMaterial = new THREE.MeshStandardMaterial({
                transparent: true,
                opacity: 0.8,
                depthWrite: false,
                color: 0xffffff
            });
            loader.load(data.cloudsTexture, (tex) => { cloudsMaterial.map = tex; cloudsMaterial.needsUpdate = true; console.log('Earth clouds loaded'); });
            const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
            group.add(clouds);
            planets[planets.length - 1].clouds = clouds;
        }
        if (data.name === 'Saturn') {
            const ringGeometry = new THREE.RingGeometry(data.radius * 1.2, data.radius * 2.5, 128);
            const ringMaterial = new THREE.MeshStandardMaterial({
                side: THREE.DoubleSide,
                transparent: true
            });
            loader.load(data.ringTexture, (tex) => { ringMaterial.map = tex; ringMaterial.alphaMap = tex; ringMaterial.needsUpdate = true; console.log('Saturn rings loaded'); });
            const rings = new THREE.Mesh(ringGeometry, ringMaterial);
            rings.rotation.x = Math.PI / 2;
            group.add(rings);
        }

        // Orbit line (using Curve for smoother lines)
        const orbitCurve = new THREE.EllipseCurve(0, 0, data.distance, data.distance, 0, 2 * Math.PI, false, 0);
        const orbitPoints = orbitCurve.getPoints(128);
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
        const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial); // Closed loop
        orbit.rotation.x = Math.PI / 2;
        scene.add(orbit);
        orbitLines.push(orbit);

        // Apply tilt if present
        if (data.tilt) planet.rotation.z = (data.tilt * Math.PI) / 180;
    });

    // Moon for Earth (with tilt for accurate eclipse simulation)
    const earthIndex = planets.findIndex(p => p.data.name === 'Earth');
    const earthGroup = planets[earthIndex].group;
    const moonRadius = 0.272 * earthRadius;
    const moonDistance = 3; // Scaled, real is ~30 Earth radii
    const moonGeometry = new THREE.SphereGeometry(moonRadius, 32, 32);
    const moonMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    loader.load('./textures/2k_moon.jpg', (tex) => { moonMaterial.map = tex; moonMaterial.needsUpdate = true; console.log('Moon loaded'); });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.castShadow = true;
    moon.receiveShadow = true;
    moon.userData = {
        name: 'Moon',
        diameter: '3,474 km',
        distSun: '1 AU (orbits Earth)',
        orbPeriod: '27.3 days around Earth',
        rotPeriod: '27.3 days (tidally locked)',
        moons: 'N/A',
        funFact: 'The Moon causes tides on Earth and is tidally locked, so we always see the same side!',
        sizeComparison: 'Smaller than Earth (diameter 27% of Earth)',
        massComparison: 'Mass: 1.2% of Earth'
    };

    // Moon orbit group with NASA tilt (5.145° to ecliptic)
    const moonOrbitGroup = new THREE.Group();
    moonOrbitGroup.rotation.z = (5.145 * Math.PI) / 180; // Tilt the orbital plane
    earthGroup.add(moonOrbitGroup);
    moonOrbitGroup.add(moon);

    let moonAngle = 0;
    const moonOrbitalPeriod = 0.0748; // 27.3 days / 365.25 ≈ 0.0748 years

    // Moon orbit line (smoother curve, added to tilted group)
    const moonOrbitCurve = new THREE.EllipseCurve(0, 0, moonDistance, moonDistance, 0, 2 * Math.PI, false, 0);
    const moonOrbitPoints = moonOrbitCurve.getPoints(64);
    const moonOrbitGeometry = new THREE.BufferGeometry().setFromPoints(moonOrbitPoints);
    const moonOrbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
    const moonOrbit = new THREE.LineLoop(moonOrbitGeometry, moonOrbitMaterial); // Closed loop
    moonOrbit.rotation.x = Math.PI / 2;
    moonOrbitGroup.add(moonOrbit);

    // Asteroid Belt (between Mars and Jupiter, clickable with info)
    const asteroidInner = 2.2 * auScale;
    const asteroidOuter = 3.2 * auScale;
    const asteroidCount = 5000;
    const asteroidGeometry = new THREE.BufferGeometry();
    const asteroidVertices = [];
    const asteroidColors = [];
    for (let i = 0; i < asteroidCount; i++) {
        const radius = THREE.MathUtils.randFloat(asteroidInner, asteroidOuter);
        const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
        const phi = THREE.MathUtils.randFloat(-0.05, 0.05);
        const x = radius * Math.cos(theta);
        const y = phi * auScale;
        const z = radius * Math.sin(theta);
        asteroidVertices.push(x, y, z);
        const color = new THREE.Color(0xaaaaaa).multiplyScalar(THREE.MathUtils.randFloat(0.5, 1));
        asteroidColors.push(color.r, color.g, color.b);
    }
    asteroidGeometry.setAttribute('position', new THREE.Float32BufferAttribute(asteroidVertices, 3));
    asteroidGeometry.setAttribute('color', new THREE.Float32BufferAttribute(asteroidColors, 3));
    const asteroidMaterial = new THREE.PointsMaterial({ vertexColors: true, size: 0.1 });
    const asteroidBelt = new THREE.Points(asteroidGeometry, asteroidMaterial);
    asteroidBelt.userData = {
        name: 'Asteroid Belt',
        diameter: 'N/A (region)',
        distSun: '2.2-3.2 AU',
        orbPeriod: '3-6 years (varies)',
        rotPeriod: 'N/A',
        moons: 'N/A',
        funFact: 'The Asteroid Belt is a ring of rocky objects between Mars and Jupiter. It\'s where most asteroids in our solar system are found!',
        sizeComparison: 'N/A (vast region, not a planet)',
        massComparison: 'Total mass: less than the Moon'
    };
    scene.add(asteroidBelt);

    // Kuiper Belt (subtle ring of icy particles beyond Neptune)
    const kuiperInner = 30 * auScale;
    const kuiperOuter = 50 * auScale;
    const kuiperCount = 5000; // Number of particles for density
    const kuiperGeometry = new THREE.BufferGeometry();
    const kuiperVertices = [];
    const kuiperColors = [];
    for (let i = 0; i < kuiperCount; i++) {
        const radius = THREE.MathUtils.randFloat(kuiperInner, kuiperOuter);
        const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
        const phi = THREE.MathUtils.randFloat(-0.05, 0.05); // Slight thickness
        const x = radius * Math.cos(theta);
        const y = phi * auScale;
        const z = radius * Math.sin(theta);
        kuiperVertices.push(x, y, z);
        const color = new THREE.Color(0xaaaaaa).multiplyScalar(THREE.MathUtils.randFloat(0.5, 1));
        kuiperColors.push(color.r, color.g, color.b);
    }
    kuiperGeometry.setAttribute('position', new THREE.Float32BufferAttribute(kuiperVertices, 3));
    kuiperGeometry.setAttribute('color', new THREE.Float32BufferAttribute(kuiperColors, 3));
    const kuiperMaterial = new THREE.PointsMaterial({ vertexColors: true, size: 0.1 });
    const kuiperBelt = new THREE.Points(kuiperGeometry, kuiperMaterial);
    scene.add(kuiperBelt);

    // Initial camera near Earth (close-up for Day-Night View)
    const initialOffset = new THREE.Vector3(0, 0, 3); // Even closer to fit Earth and Moon
    camera.position.copy(earthGroup.position.clone().add(initialOffset));
    controls.target.copy(earthGroup.position);

    const clock = new THREE.Clock();
    const speedSlider = document.getElementById('speedSlider');
    const pauseCheckbox = document.getElementById('pauseCheckbox');
    const infoDiv = document.getElementById('info');
    const earthModeToggle = document.getElementById('earthModeToggle');

    let paused = false;
    pauseCheckbox.addEventListener('change', () => {
        paused = pauseCheckbox.checked;
    });

    let earthMode = true; // Start in Day-Night View
    earthModeToggle.addEventListener('change', () => {
        earthMode = earthModeToggle.checked;
        if (earthMode) {
            // Switch to close-up
            controls.maxDistance = 10; // Tight zoom for Earth focus
            const currentEarthPos = earthGroup.position.clone();
            camera.position.copy(currentEarthPos.clone().add(initialOffset));
            controls.target.copy(currentEarthPos);
            controls.update();
        } else {
            // Switch to Solar View
            controls.maxDistance = 2000; // Limit to last planet area
            camera.position.set(0, 100, 200); // Zoom out to show all
            controls.target.set(0, 0, 0); // Center on Sun
            controls.update();
        }
    });

    // Raycaster for planet info (expanded with more facts, now includes Moon, Sun, and Asteroid Belt)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseDown(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects([sun, moon, asteroidBelt, ...planets.map(p => p.mesh)]);
        if (intersects.length > 0) {
            const object = intersects[0].object;
            const data = object.userData;
            infoDiv.innerHTML = `
                <h3>${data.name}</h3>
                <p>${data.sizeComparison}</p>
                <p>${data.massComparison}</p>
                <p>Distance from Sun: ${data.distSun}</p>
                <p>Year Length: ${data.orbPeriod}</p>
                <p>Day Length: ${data.rotPeriod}</p>
                <p>Moons: ${data.moons}</p>
                <p>Fun Fact: ${data.funFact}</p>
            `;
            infoDiv.style.display = 'block';
            setTimeout(() => { infoDiv.style.display = 'none'; }, 10000);
        }
    }
    renderer.domElement.addEventListener('mousedown', onMouseDown);

    function animate() {
        requestAnimationFrame(animate);
        controls.update();

        const delta = clock.getDelta();
        const timeSpeed = parseFloat(speedSlider.value) * 0.5; // Slower speed by default (halved)

        if (!paused) {
            planets.forEach(p => {
                p.angle += delta * timeSpeed * (2 * Math.PI / p.data.orbitalPeriod) / 60;
                const posX = p.data.distance * Math.cos(p.angle);
                const posZ = p.data.distance * Math.sin(p.angle);
                p.group.position.set(posX, 0, posZ);

                const rotSign = Math.sign(p.data.rotationPeriod);
                const rotPeriodAbs = Math.abs(p.data.rotationPeriod);
                p.mesh.rotation.y += delta * timeSpeed * (2 * Math.PI / rotPeriodAbs) * rotSign / 10;

                if (p.clouds) p.clouds.rotation.y += delta * timeSpeed * (2 * Math.PI / p.data.rotationPeriod) / 15;
            });

            moonAngle += delta * timeSpeed * (2 * Math.PI / moonOrbitalPeriod) / 60;
            moon.position.set(moonDistance * Math.cos(moonAngle), 0, moonDistance * Math.sin(moonAngle));

            // Subtle Kuiper Belt rotation
            kuiperBelt.rotation.y += delta * timeSpeed * 0.00005;

            // Subtle Asteroid Belt rotation
            asteroidBelt.rotation.y += delta * timeSpeed * 0.0001;
        }

        // Follow in Day-Night View
        if (earthMode) {
            controls.target.copy(earthGroup.position);
        }

        renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});