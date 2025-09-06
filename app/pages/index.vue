<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" md="8" class="text-center">
        <h1>理想の自分を可視化するツール</h1>
        <v-btn color="primary" large @click="startDiagnosis">
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
}
</style>
