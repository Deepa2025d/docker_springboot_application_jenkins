pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-cred-id')
        IMAGE_NAME = "deepaselvakumar/springboot-app"
    }

    stages {
        stage('Build with Maven') {
            steps {
                echo 'Building Spring Boot application...'
                sh 'mvn clean package -DskipTests'
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building Docker image...'
                sh "docker build -t $IMAGE_NAME:${BUILD_NUMBER} ."
            }
        }

        stage('Docker Login & Push') {
            steps {
                echo 'Logging in to Docker Hub...'
                sh "echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin"
                echo 'Pushing image to Docker Hub...'
                sh "docker push $IMAGE_NAME:${BUILD_NUMBER}"
                // Optional: also push latest tag
                sh "docker tag $IMAGE_NAME:${BUILD_NUMBER} $IMAGE_NAME:latest"
                sh "docker push $IMAGE_NAME:latest"
            }
        }

        stage('Deploy to Hardware') {
            steps {
                echo 'Deploying Docker image to hardware environment...'
                sh "ssh user@hardware 'docker pull $IMAGE_NAME:${BUILD_NUMBER} && docker run -d -p 8080:8080 $IMAGE_NAME:${BUILD_NUMBER}'"
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check logs.'
        }
    }
}
