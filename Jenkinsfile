pipeline {
    agent any 
    
    environment {
        // Define image names
        DEV_IMAGE = "maalijay/klimate-app-dev"
        PROD_IMAGE = "maalijay/klimate-app"
        DOCKER_REGISTRY = "docker.io"
    }
    
    stages { 
        stage('SCM Checkout') {
            steps {
                retry(3) {
                    git branch: 'main', url: 'https://github.com/SMaaliJay2000/Klimate-app.git'
                }
            }
        }
        
        stage('Build Development Image') {
            steps {  
                script {
                    echo "Building development image..."
                    bat "docker build -t ${DEV_IMAGE}:${BUILD_NUMBER} -f Dockerfile ."
                    bat "docker tag ${DEV_IMAGE}:${BUILD_NUMBER} ${DEV_IMAGE}:latest"
                }
            }
        }
        
        stage('Build Production Image') {
            steps {  
                script {
                    echo "Building production image..."
                    bat "docker build -t ${PROD_IMAGE}:${BUILD_NUMBER} -f Dockerfile.prod ."
                    bat "docker tag ${PROD_IMAGE}:${BUILD_NUMBER} ${PROD_IMAGE}:latest"
                }
            }
        }
        
        stage('Login to Docker Hub') {
            steps {
                withCredentials([string(credentialsId: 'maalijay-dockerhub-pwd', variable: 'docker-hub-password')]) {
                    script {
                        bat "docker login -u maalijay -p %docker-hub-password%"
                    }
                }
            }
        }
        
        stage('Push Development Image') {
            steps {
                script {
                    echo "Pushing development image..."
                    bat "docker push ${DEV_IMAGE}:${BUILD_NUMBER}"
                    bat "docker push ${DEV_IMAGE}:latest"
                }
            }
        }
        
        stage('Push Production Image') {
            steps {
                script {
                    echo "Pushing production image..."
                    bat "docker push ${PROD_IMAGE}:${BUILD_NUMBER}"
                    bat "docker push ${PROD_IMAGE}:latest"
                }
            }
        }
        
        stage('Test Development Container') {
            steps {
                script {
                    echo "Testing development container..."
                    bat "docker run -d --name klimate-dev-test-${BUILD_NUMBER} -p 5174:5173 ${DEV_IMAGE}:${BUILD_NUMBER}"
                    
                    // Wait for container to start
                    sleep(time: 10, unit: 'SECONDS')
                    
                    // Health check (optional)
                    bat "docker ps | findstr klimate-dev-test-${BUILD_NUMBER}"
                    
                    // Clean up test container
                    bat "docker stop klimate-dev-test-${BUILD_NUMBER}"
                    bat "docker rm klimate-dev-test-${BUILD_NUMBER}"
                }
            }
        }
        
        stage('Test Production Container') {
            steps {
                script {
                    echo "Testing production container..."
                    bat "docker run -d --name klimate-prod-test-${BUILD_NUMBER} -p 3001:3000 ${PROD_IMAGE}:${BUILD_NUMBER}"
                    
                    // Wait for container to start
                    sleep(time: 15, unit: 'SECONDS')
                    
                    // Health check (optional)
                    bat "docker ps | findstr klimate-prod-test-${BUILD_NUMBER}"
                    
                    // Clean up test container
                    bat "docker stop klimate-prod-test-${BUILD_NUMBER}"
                    bat "docker rm klimate-prod-test-${BUILD_NUMBER}"
                }
            }
        }
        
        stage('Deploy with Docker Compose') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "Deploying with Docker Compose..."
                    
                    // Deploy development version
                    bat "docker-compose -f docker-compose.yml down || echo 'No existing dev containers'"
                    bat "docker-compose -f docker-compose.yml up -d"
                    
                    // Optionally deploy production version
                    // bat "docker-compose -f docker-compose.prod.yml down || echo 'No existing prod containers'"
                    // bat "docker-compose -f docker-compose.prod.yml up -d"
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo "Cleaning up..."
                bat 'docker logout'
                
                // Clean up any test containers that might still be running
                bat "docker stop klimate-dev-test-${BUILD_NUMBER} || echo 'Dev test container not running'"
                bat "docker rm klimate-dev-test-${BUILD_NUMBER} || echo 'Dev test container not found'"
                bat "docker stop klimate-prod-test-${BUILD_NUMBER} || echo 'Prod test container not running'"
                bat "docker rm klimate-prod-test-${BUILD_NUMBER} || echo 'Prod test container not found'"
                
                // Clean up dangling images
                bat "docker image prune -f || echo 'No dangling images to remove'"
            }
        }
        success {
            echo "Pipeline completed successfully!"
            echo "Development image: ${DEV_IMAGE}:${BUILD_NUMBER}"
            echo "Production image: ${PROD_IMAGE}:${BUILD_NUMBER}"
        }
        failure {
            echo "Pipeline failed!"
            // You can add notification steps here
        }
    }
}