import {db} from './dbConfig';
import { Users, Notifications,Reports,Transactions, Rewards } from './schema';
import {eq ,sql,and, or, desc} from 'drizzle-orm'

export async function createUser(email:string, name:string

) {
    try{
        const [user]= await db.insert(Users).values({
            email,name
        }).returning().execute();
        return user;
    }catch(error){
        console.log(error);

    }
}

export async function getUserByEmail(email:string){
    try{
        const [user]= await db.select(Users).where(eq(Users.email,email)).execute();
        return user;
    }catch(error){
        console.log('error fetching user by Email',error);
    }
}


export async function getUnreadNotifications(userId:string){
    try{
        return await db.select(Notifications).where(and(eq(Notifications.userId,userId),eq(Notifications.isRead,false))).execute();
        
    }catch(error){
        console.log('error fetching unread notifications',error);
    }
}

export async function getUserBalance(userId: number): Promise<number> {
  const transactions = await getRewardTransactions(userId);
  const balance = transactions.reduce((acc, transaction) => {
    return transaction.type.startsWith('earned') ? acc + transaction.amount : acc - transaction.amount
  }, 0);
  return Math.max(balance, 0); // Ensure balance is never negative
}

export async function getRewardTransactions(userId: number) {
    try {
      console.log('Fetching transactions for user ID:', userId)
      const transactions = await db
        .select({
          id: Transactions.id,
          type: Transactions.type,
          amount: Transactions.amount,
          description: Transactions.description,
          date: Transactions.date,
        })
        .from(Transactions)
        .where(eq(Transactions.userId, userId))
        .orderBy(desc(Transactions.date))
        .limit(10)
        .execute();
  
      console.log('Raw transactions from database:', transactions)
  
      const formattedTransactions = transactions.map(t => ({
        ...t,
        date: t.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      }));
  
      console.log('Formatted transactions:', formattedTransactions)
      return formattedTransactions;
    } catch (error) {
      console.error("Error fetching reward transactions:", error);
      return [];
    }
  }

export async function markNotificationAsRead(notificationId:number){
    try{
        await db.update(Notifications).set({isRead:true}).where(eq(Notifications.id,notificationId)).execute();
    }catch(error){
        console.log('error marking notification as read',error);
    }
}

export async function createReport(
  userId: number,
  location: string,
  wasteType: string,
  amount: number,
  imageUrl: string,
  verificationResult?: string
){
  try{
    const [report] = await db.insert(Reports).values({
      userId,location,wasteType,amount,imageUrl,verificationResult,status:"pending"
    }).returning().execute();
    const pointsEarnerd= 10;
    //update reward points
    await updateRewardPoints(userId,pointsEarnerd);
    //createTransaction
    await createTransaction(userId,'earned_report',pointsEarnerd,'Earned points for reporting waste');
    //createNotification
    await createNotification(userId,'Report submitted successfully','report_submitted');
  }catch(e){console.log(e)}
}

export async function updateRewardPoints(userId:number,pointsToAdd:number){
  try{
    const [updatedReward] = await db.update(Rewards).set({
      points:sql`${Rewards.points}+${pointsToAdd}`
    }).where(eq(Rewards.user_id,userId)).returning().execute();
    return updatedReward;
  }catch(e){console.error('Error updating reward points',e)}
  return null;
}

export async function createTransaction(userId:number, type:'earned_report'|'earner_collect'|'redeemed',amount:number,description:string){
  try{
    const [transaction] = await db.insert(Transactions).values({
      userId,type,amount,description
    }).returning().execute();
    return transaction;
  }catch(e){console.error('Error creating transaction',e)}
  return null;
}

export async function createNotification(userId: number, message: string, type: string) {
  try {
    const [notification] = await db
      .insert(Notifications)
      .values({ userId, message, type })
      .returning()
      .execute();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

export async function getRecentReports(limit: number = 10) {
  try {
    const reports = await db
      .select()
      .from(Reports)
      .orderBy(desc(Reports.created_at))
      .limit(limit)
      .execute();
    return reports;
  } catch (error) {
    console.error("Error fetching recent reports:", error);
    return [];
  }
}