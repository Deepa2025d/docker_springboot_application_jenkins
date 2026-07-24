pipeline {
    agent any

    stages {
        stage('Screening & Study') {
            steps {
                echo 'Starting screening and studying application...'
                // Example: run lint or static analysis
                sh 'npm run lint'
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Building frontend application...'
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('Deploy to Hardware') {
            steps {
                echo 'Deploying build into hardware environment...'
                // Replace with your actual hardware deployment command
                sh 'scp -r build/* user@hardware:/var/www/html/'
            }
        }

        stage('Verification') {
            steps {
                echo 'Checking public result for review...'
                // Example: curl endpoint to verify deployment
                sh 'curl http://hardware/public/status || true'
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
