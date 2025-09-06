<template>
  <div class="stars"></div>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" md="8" class="text-center">
        <h1 class="star-title">理想の自分を可視化するツール</h1>
        <v-btn color="yellow" large @click="startDiagnosis" class="mt-5">
          診断開始
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useRouter } from '#app'
const router = useRouter()
function startDiagnosis() {
  // 以前の診断結果があればクリア
  localStorage.removeItem('ideal_results')
  localStorage.removeItem('currentResultText')
  localStorage.removeItem('gender')
  router.push('/diagnosis')
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 夜空のグラデーション背景 */
  background: linear-gradient(180deg, #0d1b2a 0%, #1b263b 100%);
  position: relative;
  overflow: hidden;
}

/* 星を描画するレイヤー */
.stars {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  pointer-events: none;
  z-index: 2;
}

/* 星の生成（box-shadowで複数の星を一括生成） */
.stars::before {
  content: '';
  position: absolute;
  width: 4px; height: 4px;
  border-radius: 50%;
  background: white;
  box-shadow:
    50vw 10vh 1px 1px #fff,
    20vw 30vh 2px 2px #fff,
    80vw 60vh 1px 1px #fff,
    10vw 80vh 1.5px 1.5px #fff,
    70vw 20vh 1px 1px #fff,
    40vw 50vh 2px 2px #fff,
    60vw 70vh 1px 1px #fff,
    30vw 90vh 1.5px 1.5px #fff,
    90vw 40vh 1px 1px #fff,
    15vw 60vh 2px 2px #fff;
  animation: twinkle 2s infinite alternate;
  opacity: 0.8;
}

/* 星のまたたきアニメーション */
@keyframes twinkle {
  0% { opacity: 0.8; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
}
.star-title {
  color: #fff;
  text-shadow: 0 0 8px #222, 0 0 2px #fff;
}

/* 星を描画するレイヤー */
.stars {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  pointer-events: none;
  z-index: 2;
}

/* 星の生成（複数の擬似要素でランダムな瞬き） */
.stars::before,
.stars::after {
  content: '';
  position: absolute;
  width: 2px; height: 2px;
  border-radius: 50%;
  background: white;
  opacity: 0.8;
}

.stars::before {
  box-shadow:
    10vw 10vh 1px 1px #fff,
    20vw 30vh 2px 2px #fff,
    80vw 60vh 1px 1px #fff,
    10vw 80vh 1.5px 1.5px #fff,
    70vw 20vh 1px 1px #fff,
    40vw 50vh 2px 2px #fff,
    60vw 70vh 1px 1px #fff,
    30vw 90vh 1.5px 1.5px #fff,
    90vw 40vh 1px 1px #fff,
    15vw 60vh 2px 2px #fff,
    25vw 20vh 1px 1px #fff,
    55vw 80vh 2px 2px #fff,
    75vw 10vh 1.5px 1.5px #fff,
    85vw 85vh 1px 1px #fff,
    35vw 70vh 2px 2px #fff;
  animation: twinkle 2s infinite alternate;
  animation-delay: 0s;
}

.stars::after {
  box-shadow:
    12vw 15vh 1.5px 1.5px #fff,
    22vw 35vh 1px 1px #fff,
    82vw 65vh 2px 2px #fff,
    15vw 85vh 1px 1px #fff,
    72vw 25vh 1.5px 1.5px #fff,
    45vw 55vh 1px 1px #fff,
    62vw 75vh 2px 2px #fff,
    32vw 95vh 1px 1px #fff,
    92vw 45vh 1.5px 1.5px #fff,
    18vw 65vh 2px 2px #fff,
    28vw 25vh 1px 1px #fff,
    58vw 85vh 2px 2px #fff,
    78vw 15vh 1.5px 1.5px #fff,
    88vw 90vh 1px 1px #fff,
    38vw 75vh 2px 2px #fff;
  animation: twinkle 2.5s infinite alternate;
  animation-delay: 1s;
}

/* 星のまたたきアニメーション */
@keyframes twinkle {
  0% { opacity: 0.8; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
}
</style>
