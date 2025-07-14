pipeline {
    agent any 
    
    environment {
        // Define image names
        PROD_IMAGE = "maalijay/klimate-app"
        DOCKER_REGISTRY = "docker.io"
        GIT_URL = 'https://github.com/SMaaliJay2000/Klimate-app.git'
        GIT_CREDENTIALS_ID = 'github-credentials'
    }
    
    stages { 
        stage('Debug Credentials') {
            steps {
                script {
                    echo "Testing Git credentials with URL: ${GIT_URL}"
                    bat "git ls-remote ${GIT_URL}"
                }
            }
        }
        
        stage('SCM Checkout') {
            steps {
                retry(3) {
                    git credentialsId: "${GIT_CREDENTIALS_ID}", url: "${GIT_URL}", branch: 'main'
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
        
        stage('Push Production Image') {
            steps {
                script {
                    echo "Pushing production image..."
                    bat "docker push ${PROD_IMAGE}:${BUILD_NUMBER}"
                    bat "docker push ${PROD_IMAGE}:latest"
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
                    
                    // Deploy production version
                    bat "docker-compose -f docker-compose.prod.yml down || echo 'No existing prod containers'"
                    bat "docker-compose -f docker-compose.prod.yml up -d"
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo "Cleaning up..."
                bat 'docker logout'
                
                // Clean up dangling images
                bat "docker image prune -f || echo 'No dangling images to remove'"
            }
        }
        success {
            echo "Pipeline completed successfully!"
            echo "Production image: ${PROD_IMAGE}:${BUILD_NUMBER}"
        }
        failure {
            echo "Pipeline failed!"
            // You can add notification steps here
        }
    }
}