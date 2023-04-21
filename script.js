import * as THREE from './build/three.module.js';
import { OrbitControls } from './jsm/OrbitControls.js';
import { GLTFLoader } from './jsm/GLTFLoader.js';
import { RGBELoader } from './jsm/RGBELoader.js';

let camera, scene, renderer, mesh, controls;
let model;
let subindo = true;

init();
render();

function init() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000);
    // camera.position.z  = 400;

    //Iniciar a cena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    console.log(scene);

    //Iniciar renderer
    renderer = new THREE.WebGLRenderer({
        antialias: false
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    document.body.appendChild(renderer.domElement);

    //Adicionar sombra
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.autoClear = false;

    /*  //Adicionando um cubo
     const geometry = new THREE.BoxGeometry(200,200,200);
     const material = new THREE.MeshBasicMaterial();
     mesh = new THREE.Mesh(geometry, material);
     mesh.name = 'caixa';
     // mesh.scale.x = 0.5;
     mesh.material.color = new THREE.Color(0.50, 0.50, 0.30);
     scene.add(mesh); */

    //controles da cena
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 0.8;
    controls.maxDistance = 3;
    console.log(controls);

    //Adicionando as luzes
    const light = new THREE.AmbientLight(0x404040);
    // scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.bias = -0.0001;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.position.set(0, 2, 0);
    scene.add(directionalLight);


    //Adicionar o objeto
    const loader = new GLTFLoader().setPath('./models/');
    loader.load('moto.glb', function (glb) {

        model = glb.scene;
        model.scale.set(0.01, 0.01, 0.01);
        scene.add(model);

        let box = new THREE.Box3().setFromObject(model);
        let obj_size = box.getSize(new THREE.Vector3(0, 0, 0));
        console.log(obj_size);
        camera.position.z = obj_size.length() * 1.5;

        //Alinhando o objeto
        box.getCenter(controls.target);

        model.traverse(function (child) {
            child.receiveShadow = true;
            child.castShadow = true;
        });

        const geometry = new THREE.PlaneGeometry(20, 20);
        const material = new THREE.ShadowMaterial({ opacity: 0.05 });
        const plane = new THREE.Mesh(geometry, material);
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI / 2;
        // plane.position.y = -obj_size.y / 2;

        scene.add(plane);

    });

    new RGBELoader()
        .setPath('./')
        .load('photo_studio_01_2k.hdr', function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.environment = texture;
        });

}

//Resize of windows   
window.onresize = function () {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
    //loop
    requestAnimationFrame(render);
    // mesh.rotation.x += 0.005;

    if (model) {
        if (subindo) {
            model.position.y += 0.0025;
            if (model.position.y > 0.15) {
                subindo = false;
            }
        } else {
            model.position.y -= 0.0025;
            if (model.position.y < 0) {
                subindo = true;
            }

        }

    }
    //Atualizar controles para efeito de damping
    if (controls) {
        controls.update();
    };

    //renderiza a cena
    renderer.render(scene, camera);
}