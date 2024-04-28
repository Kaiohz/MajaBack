pipeline {
    agent any
    options {
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
    }

    environment {
        APP_NAME = "majaback"
        CHROME_BIN="/usr/bin/chromium-browser"
        REMOTE_TARGET = "192.168.1.33"
        PATH_DEST = "/home/pi/prod/majaback"
        REPOSITORY = "majaback"
        ARTIFACTORY_HOST = "192.168.1.28:8082"
        VERSION = sh(script:'node -e "console.log(require(\'./package.json\').version);"',returnStdout: true).trim()
        PACKAGE_NAME = "${APP_NAME}-${VERSION}"
    }

    stages {

        stage('Build') {
            steps { 
                echo '******** Build the app ********'
                sh 'npm pack' 
            }
        }

        stage('Artifactory'){
            steps{
                echo '******** Copy artifact to artifactory ********'
                sh "curl -u admin:Password1 -T ${PACKAGE_NAME}.tgz http://${ARTIFACTORY_HOST}/artifactory/${REPOSITORY}/${PACKAGE_NAME}-${GIT_COMMIT}.tgz"
            }
        }

       stage('Maj app on remote server') {
            steps { 
                echo '******** Maj app on remote server ********'
                //in case server is already running
                sh "sshpass -p ${password} ssh pi@${REMOTE_TARGET} 'cd ${PATH_DEST};git stash;git pull'"
            }
        }
    }
    post { 
        always { 
            echo '******** End of pipeline ********'
            deleteDir()
        }
    }
}
