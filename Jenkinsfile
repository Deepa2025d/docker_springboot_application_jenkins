pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-cred-id-')
        IMAGE_NAME   = "deepaselvakumar/springboot-app"
        SERVER_IP    = "13.233.157.6"
        SSH_USER     = "ubuntu"
    }

    stages {
        stage('Docker Build') {
            steps {
                echo 'Building Docker image...'
                sh "docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} ."
                sh "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${IMAGE_NAME}:latest"
            }
        }

        stage('Docker Login & Push') {
            steps {
                echo 'Logging in to Docker Hub...'
                sh '''
                    echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login -u "$DOCKERHUB_CREDENTIALS_USR" --password-stdin
                '''
                echo 'Pushing images...'
                sh """
                    docker push ${IMAGE_NAME}:${BUILD_NUMBER}
                    docker push ${IMAGE_NAME}:latest
                """
            }
            post {
                always {
                    sh 'docker logout || true'
                }
            }
        }

        stage('Deploy to Server') {
            steps {
                echo 'Deploying Docker image to target server...'
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'deploy-server-ssh-key',
                    keyFileVariable: 'SSH_KEY',
                    usernameVariable: 'SSH_USER_CRED'
                )]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no -i \$SSH_KEY ${SSH_USER}@${SERVER_IP} '
                            docker pull ${IMAGE_NAME}:${BUILD_NUMBER} &&
                            docker stop springboot-app || true &&
                            docker rm springboot-app || true &&
                            docker run -d --name springboot-app -p 8080:8080 ${IMAGE_NAME}:${BUILD_NUMBER}
                        '
                    """
                }
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