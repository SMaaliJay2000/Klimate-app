pipeline{
  agent { label 'Jenkins-Agent' }
  tools {
    nodejs 'NodeJs22'
  }

  stages{
    stage("Cleanup Workspace"){
      steps{
        cleanWs()
      }
    }

    stage("Checkout from SCM"){
      steps{
        git branch: 'main', credentialsId: 'github', url: 'https://github.com/SMaaliJay2000/Klimate-app.git'
      }
    }

    stage('Build Application') {
      steps {
                sh '''
                    npm ci
                    npm run build
                '''
      }
    }

    stage('Test Application') {
            steps {
                sh 'npm test'
            }
    }
  }
}
